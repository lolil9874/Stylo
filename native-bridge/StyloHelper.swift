#!/usr/bin/env swift

import Foundation
import ApplicationServices

// MARK: - Error Types
enum StyloHelperError: String, CaseIterable {
    case noFocusedElement = "no_focused_element"
    case notATextElement = "not_a_text_element"
    case permissionDenied = "permission_denied"
    case secureField = "secure_field"
    case invalidInput = "invalid_input"
    case axError = "ax_error"
    
    var message: String {
        switch self {
        case .noFocusedElement:
            return "No focused element found"
        case .notATextElement:
            return "Focused element is not a text field"
        case .permissionDenied:
            return "Accessibility permission denied"
        case .secureField:
            return "Secure text field not supported"
        case .invalidInput:
            return "Invalid input provided"
        case .axError:
            return "Accessibility API error"
        }
    }
}

// MARK: - Response Structure
struct StyloResponse {
    let success: Bool
    let data: String?
    let error: String?
    let errorCode: String?
    
    func toJSON() -> String {
        let dict: [String: Any] = [
            "success": success,
            "data": data ?? "",
            "error": error ?? "",
            "errorCode": errorCode ?? ""
        ]
        
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: dict, options: [])
            return String(data: jsonData, encoding: .utf8) ?? "{}"
        } catch {
            return "{\"success\":false,\"error\":\"JSON serialization failed\",\"errorCode\":\"json_error\"}"
        }
    }
}

// MARK: - Main Helper Class
class StyloHelper {
    
    // MARK: - Permission Checking
    static func checkAccessibilityPermission() -> Bool {
        let options: NSDictionary = [kAXTrustedCheckOptionPrompt.takeRetainedValue(): false]
        return AXIsProcessTrustedWithOptions(options)
    }
    
    // MARK: - Get Focused Text
    static func getFocusedText() -> StyloResponse {
        // Check accessibility permission first
        guard checkAccessibilityPermission() else {
            return StyloResponse(
                success: false,
                data: nil,
                error: StyloHelperError.permissionDenied.message,
                errorCode: StyloHelperError.permissionDenied.rawValue
            )
        }
        
        // Get the focused UI element
        var focusedElement: CFTypeRef?
        let result = AXUIElementCopyAttributeValue(AXUIElementCreateSystemWide(), kAXFocusedUIElementAttribute as CFString, &focusedElement)
        
        guard result == .success, let element = focusedElement else {
            return StyloResponse(
                success: false,
                data: nil,
                error: StyloHelperError.noFocusedElement.message,
                errorCode: StyloHelperError.noFocusedElement.rawValue
            )
        }
        
        let focusedAXElement = element as! AXUIElement
        
        // Check if it's a text field
        var role: CFTypeRef?
        let roleResult = AXUIElementCopyAttributeValue(focusedAXElement, kAXRoleAttribute as CFString, &role)
        
        guard roleResult == .success, let roleString = role as? String else {
            return StyloResponse(
                success: false,
                data: nil,
                error: StyloHelperError.notATextElement.message,
                errorCode: StyloHelperError.notATextElement.rawValue
            )
        }
        
        // Check for secure text field
        if roleString == "AXSecureTextField" {
            return StyloResponse(
                success: false,
                data: nil,
                error: StyloHelperError.secureField.message,
                errorCode: StyloHelperError.secureField.rawValue
            )
        }
        
        // Check if it's a supported text element
        let supportedRoles = ["AXTextField", "AXTextArea", "AXStaticText", "AXWebArea", "AXScrollArea"]
        guard supportedRoles.contains(roleString) else {
            return StyloResponse(
                success: false,
                data: nil,
                error: StyloHelperError.notATextElement.message,
                errorCode: StyloHelperError.notATextElement.rawValue
            )
        }
        
        // Get the value
        var value: CFTypeRef?
        let valueResult = AXUIElementCopyAttributeValue(focusedAXElement, kAXValueAttribute as CFString, &value)
        
        guard valueResult == .success, let valueString = value as? String else {
            return StyloResponse(
                success: false,
                data: nil,
                error: StyloHelperError.axError.message,
                errorCode: StyloHelperError.axError.rawValue
            )
        }
        
        return StyloResponse(
            success: true,
            data: valueString,
            error: nil,
            errorCode: nil
        )
    }
    
    // MARK: - Set Focused Text
    static func setFocusedText(_ newValue: String) -> StyloResponse {
        // Check accessibility permission first
        guard checkAccessibilityPermission() else {
            return StyloResponse(
                success: false,
                data: nil,
                error: StyloHelperError.permissionDenied.message,
                errorCode: StyloHelperError.permissionDenied.rawValue
            )
        }
        
        // Get the focused UI element
        var focusedElement: CFTypeRef?
        let result = AXUIElementCopyAttributeValue(AXUIElementCreateSystemWide(), kAXFocusedUIElementAttribute as CFString, &focusedElement)
        
        guard result == .success, let element = focusedElement else {
            return StyloResponse(
                success: false,
                data: nil,
                error: StyloHelperError.noFocusedElement.message,
                errorCode: StyloHelperError.noFocusedElement.rawValue
            )
        }
        
        let focusedAXElement = element as! AXUIElement
        
        // Check if it's a text field
        var role: CFTypeRef?
        let roleResult = AXUIElementCopyAttributeValue(focusedAXElement, kAXRoleAttribute as CFString, &role)
        
        guard roleResult == .success, let roleString = role as? String else {
            return StyloResponse(
                success: false,
                data: nil,
                error: StyloHelperError.notATextElement.message,
                errorCode: StyloHelperError.notATextElement.rawValue
            )
        }
        
        // Check for secure text field
        if roleString == "AXSecureTextField" {
            return StyloResponse(
                success: false,
                data: nil,
                error: StyloHelperError.secureField.message,
                errorCode: StyloHelperError.secureField.rawValue
            )
        }
        
        // Check if it's a supported text element
        let supportedRoles = ["AXTextField", "AXTextArea", "AXStaticText", "AXWebArea", "AXScrollArea"]
        guard supportedRoles.contains(roleString) else {
            return StyloResponse(
                success: false,
                data: nil,
                error: StyloHelperError.notATextElement.message,
                errorCode: StyloHelperError.notATextElement.rawValue
            )
        }
        
        // Set the value
        let setResult = AXUIElementSetAttributeValue(focusedAXElement, kAXValueAttribute as CFString, newValue as CFTypeRef)
        if setResult != .success {
            return StyloResponse(
                success: false,
                data: nil,
                error: StyloHelperError.axError.message,
                errorCode: StyloHelperError.axError.rawValue
            )
        }
        
        return StyloResponse(
            success: true,
            data: newValue,
            error: nil,
            errorCode: nil
        )
    }
    
    // MARK: - Check Permissions
    static func checkPermissions() -> StyloResponse {
        let hasAccessibility = checkAccessibilityPermission()
        
        let status = [
            "accessibility": hasAccessibility
        ]
        
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: status, options: [])
            let jsonString = String(data: jsonData, encoding: .utf8) ?? "{}"
            return StyloResponse(
                success: true,
                data: jsonString,
                error: nil,
                errorCode: nil
            )
        } catch {
            return StyloResponse(
                success: false,
                data: nil,
                error: "Failed to serialize permission status",
                errorCode: "json_error"
            )
        }
    }
}

// MARK: - Command Line Interface
func main() {
    let arguments = CommandLine.arguments
    
    guard arguments.count >= 2 else {
        print("Usage: StyloHelper <command> [args...]")
        exit(1)
    }
    
    let command = arguments[1]
    var response: StyloResponse
    
    switch command {
    case "getFocusedText":
        response = StyloHelper.getFocusedText()
        
    case "setFocusedText":
        if arguments.count >= 3 {
            response = StyloHelper.setFocusedText(arguments[2])
        } else {
            response = StyloResponse(
                success: false,
                data: nil,
                error: "Missing text value argument",
                errorCode: "missing_argument"
            )
        }
        
    case "checkPermissions":
        response = StyloHelper.checkPermissions()
        
    default:
        response = StyloResponse(
            success: false,
            data: nil,
            error: "Unknown command: \(command)",
            errorCode: "unknown_command"
        )
    }
    
    print(response.toJSON())
}

// Run the main function
main()
