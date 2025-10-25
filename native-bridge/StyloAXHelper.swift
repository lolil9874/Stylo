#!/usr/bin/env swift

import Foundation
import ApplicationServices
import Cocoa

// MARK: - Response Structure
struct AXHelperResponse: Codable {
    let ok: Bool
    let value: String?
    let errorCode: String?
    let errorMessage: String?
    let axInfo: AXInfo?
    
    func toJSON() -> String {
        let encoder = JSONEncoder()
        encoder.outputFormatting = .prettyPrinted
        if let jsonData = try? encoder.encode(self), let jsonString = String(data: jsonData, encoding: .utf8) {
            return jsonString
        }
        return "{\"ok\":false,\"errorCode\":\"JSON_ENCODE_ERROR\",\"errorMessage\":\"Failed to encode response\"}"
    }
}

struct AXInfo: Codable {
    let role: String?
    let subrole: String?
    let appBundle: String?
    let windowTitle: String?
    let elementDescription: String?
}

// MARK: - Error Codes
enum AXErrorCode: String {
    case ACCESSIBILITY_DENIED = "ACCESSIBILITY_DENIED"
    case NO_FOCUSED_ELEMENT = "NO_FOCUSED_ELEMENT"
    case NOT_A_TEXT_ELEMENT = "NOT_A_TEXT_ELEMENT"
    case SECURE_FIELD = "SECURE_FIELD"
    case AX_READ_ERROR = "AX_READ_ERROR"
    case AX_WRITE_DENIED = "AX_WRITE_DENIED"
    case UNKNOWN_ERROR = "UNKNOWN_ERROR"
}

// MARK: - Main Helper Class
class StyloAXHelper {
    
    // MARK: - Permission Checking
    static func checkAccessibilityPermission() -> Bool {
        let options: NSDictionary = [kAXTrustedCheckOptionPrompt.takeRetainedValue(): false]
        return AXIsProcessTrustedWithOptions(options)
    }
    
    // MARK: - Get AX Info
    static func getAXInfo(element: AXUIElement) -> AXInfo {
        var role: CFTypeRef?
        var subrole: CFTypeRef?
        var appBundle: String?
        var windowTitle: String?
        var description: String?
        
        // Get role
        if AXUIElementCopyAttributeValue(element, kAXRoleAttribute as CFString, &role) == .success {
            if let roleStr = role as? String {
                description = roleStr
            }
        }
        
        // Get subrole
        if AXUIElementCopyAttributeValue(element, kAXSubroleAttribute as CFString, &subrole) == .success {
            if let subroleStr = subrole as? String {
                description = (description ?? "") + " (\(subroleStr))"
            }
        }
        
        // Get app bundle
        var app: CFTypeRef?
        if AXUIElementCopyAttributeValue(element, kAXParentAttribute as CFString, &app) == .success {
            let appElement = app as! AXUIElement
            var bundleId: CFTypeRef?
            if AXUIElementCopyAttributeValue(appElement, "AXBundleIdentifier" as CFString, &bundleId) == .success {
                appBundle = bundleId as? String
            }
        }
        
        // Get window title
        var window: CFTypeRef?
        if AXUIElementCopyAttributeValue(element, kAXWindowAttribute as CFString, &window) == .success {
            let windowElement = window as! AXUIElement
            var title: CFTypeRef?
            if AXUIElementCopyAttributeValue(windowElement, kAXTitleAttribute as CFString, &title) == .success {
                windowTitle = title as? String
            }
        }
        
        return AXInfo(
            role: role as? String,
            subrole: subrole as? String,
            appBundle: appBundle,
            windowTitle: windowTitle,
            elementDescription: description
        )
    }
    
    // MARK: - Get Focused Text
    static func getFocusedText() -> AXHelperResponse {
        // Check accessibility permission first
        guard checkAccessibilityPermission() else {
            return AXHelperResponse(
                ok: false,
                value: nil,
                errorCode: AXErrorCode.ACCESSIBILITY_DENIED.rawValue,
                errorMessage: "Accessibility permission denied. Please grant access in System Preferences > Privacy & Security > Accessibility.",
                axInfo: nil
            )
        }
        
        // Get the focused UI element
        var focusedElement: CFTypeRef?
        let systemWide = AXUIElementCreateSystemWide()
        let result = AXUIElementCopyAttributeValue(systemWide, kAXFocusedUIElementAttribute as CFString, &focusedElement)
        
        guard result == .success, focusedElement != nil else {
            return AXHelperResponse(
                ok: false,
                value: nil,
                errorCode: AXErrorCode.NO_FOCUSED_ELEMENT.rawValue,
                errorMessage: "No focused element found. Place your cursor in a text field and try again.",
                axInfo: nil
            )
        }
        
        let element = focusedElement as! AXUIElement
        
        // Get AX info for debugging
        let axInfo = getAXInfo(element: element)
        
        // Check if it's a text field
        var role: CFTypeRef?
        let roleResult = AXUIElementCopyAttributeValue(element, kAXRoleAttribute as CFString, &role)
        
        guard roleResult == .success, let roleString = role as? String else {
            return AXHelperResponse(
                ok: false,
                value: nil,
                errorCode: AXErrorCode.NOT_A_TEXT_ELEMENT.rawValue,
                errorMessage: "Focused element is not a text field.",
                axInfo: axInfo
            )
        }
        
        // Check for secure text field
        if roleString == "AXSecureTextField" {
            return AXHelperResponse(
                ok: false,
                value: nil,
                errorCode: AXErrorCode.SECURE_FIELD.rawValue,
                errorMessage: "Secure text fields (passwords) are not supported by macOS Accessibility API.",
                axInfo: axInfo
            )
        }
        
        // Check if it's a supported text element
        let supportedRoles = [
            "AXTextField",
            "AXTextArea",
            "AXStaticText",
            "AXWebArea",
            "AXScrollArea",
            "AXTextView",
            "AXComboBox"
        ]
        
        guard supportedRoles.contains(roleString) else {
            return AXHelperResponse(
                ok: false,
                value: nil,
                errorCode: AXErrorCode.NOT_A_TEXT_ELEMENT.rawValue,
                errorMessage: "Focused element is not a supported text field (role: \(roleString)).",
                axInfo: axInfo
            )
        }
        
        // Get the value
        var value: CFTypeRef?
        let valueResult = AXUIElementCopyAttributeValue(element, kAXValueAttribute as CFString, &value)
        
        guard valueResult == .success else {
            return AXHelperResponse(
                ok: false,
                value: nil,
                errorCode: AXErrorCode.AX_READ_ERROR.rawValue,
                errorMessage: "Failed to read text value from element (AXError: \(valueResult.rawValue)).",
                axInfo: axInfo
            )
        }
        
        let valueString = (value as? String) ?? ""
        
        return AXHelperResponse(
            ok: true,
            value: valueString,
            errorCode: nil,
            errorMessage: nil,
            axInfo: axInfo
        )
    }
    
    // MARK: - Set Focused Text
    static func setFocusedText(_ newValue: String) -> AXHelperResponse {
        // Check accessibility permission first
        guard checkAccessibilityPermission() else {
            return AXHelperResponse(
                ok: false,
                value: nil,
                errorCode: AXErrorCode.ACCESSIBILITY_DENIED.rawValue,
                errorMessage: "Accessibility permission denied. Please grant access in System Preferences > Privacy & Security > Accessibility.",
                axInfo: nil
            )
        }
        
        // Get the focused UI element
        var focusedElement: CFTypeRef?
        let systemWide = AXUIElementCreateSystemWide()
        let result = AXUIElementCopyAttributeValue(systemWide, kAXFocusedUIElementAttribute as CFString, &focusedElement)
        
        guard result == .success, focusedElement != nil else {
            return AXHelperResponse(
                ok: false,
                value: nil,
                errorCode: AXErrorCode.NO_FOCUSED_ELEMENT.rawValue,
                errorMessage: "No focused element found. The focus may have been lost.",
                axInfo: nil
            )
        }
        
        let element = focusedElement as! AXUIElement
        
        // Get AX info for debugging
        let axInfo = getAXInfo(element: element)
        
        // Check if it's a text field
        var role: CFTypeRef?
        let roleResult = AXUIElementCopyAttributeValue(element, kAXRoleAttribute as CFString, &role)
        
        guard roleResult == .success, let roleString = role as? String else {
            return AXHelperResponse(
                ok: false,
                value: nil,
                errorCode: AXErrorCode.NOT_A_TEXT_ELEMENT.rawValue,
                errorMessage: "Focused element is not a text field.",
                axInfo: axInfo
            )
        }
        
        // Check for secure text field
        if roleString == "AXSecureTextField" {
            return AXHelperResponse(
                ok: false,
                value: nil,
                errorCode: AXErrorCode.SECURE_FIELD.rawValue,
                errorMessage: "Secure text fields (passwords) cannot be modified via Accessibility API.",
                axInfo: axInfo
            )
        }
        
        // Set the value
        let setResult = AXUIElementSetAttributeValue(element, kAXValueAttribute as CFString, newValue as CFTypeRef)
        
        if setResult != .success {
            return AXHelperResponse(
                ok: false,
                value: nil,
                errorCode: AXErrorCode.AX_WRITE_DENIED.rawValue,
                errorMessage: "Failed to write text value. The application may not allow AX modifications (AXError: \(setResult.rawValue)).",
                axInfo: axInfo
            )
        }
        
        return AXHelperResponse(
            ok: true,
            value: newValue,
            errorCode: nil,
            errorMessage: nil,
            axInfo: axInfo
        )
    }
}

// MARK: - Command Line Interface
func main() {
    let arguments = CommandLine.arguments
    
    guard arguments.count >= 2 else {
        let error = AXHelperResponse(
            ok: false,
            value: nil,
            errorCode: "INVALID_USAGE",
            errorMessage: "Usage: StyloAXHelper <getFocusedText|setFocusedText> [text]",
            axInfo: nil
        )
        print(error.toJSON())
        exit(1)
    }
    
    let command = arguments[1]
    var response: AXHelperResponse
    
    switch command {
    case "getFocusedText":
        response = StyloAXHelper.getFocusedText()
        
    case "setFocusedText":
        if arguments.count >= 3 {
            let text = arguments[2]
            response = StyloAXHelper.setFocusedText(text)
        } else {
            response = AXHelperResponse(
                ok: false,
                value: nil,
                errorCode: "MISSING_ARGUMENT",
                errorMessage: "Missing text value argument for setFocusedText",
                axInfo: nil
            )
        }
        
    default:
        response = AXHelperResponse(
            ok: false,
            value: nil,
            errorCode: "UNKNOWN_COMMAND",
            errorMessage: "Unknown command: \(command). Use getFocusedText or setFocusedText.",
            axInfo: nil
        )
    }
    
    print(response.toJSON())
}

// Run the main function
main()

