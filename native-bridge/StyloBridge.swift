#!/usr/bin/env swift

import Foundation
import ApplicationServices

// MARK: - Error Types
enum StyloBridgeError: Error, LocalizedError {
    case noFocusedElement
    case notATextField
    case permissionDenied
    case invalidInput
    case axError(String)
    
    var errorDescription: String? {
        switch self {
        case .noFocusedElement:
            return "No focused element found"
        case .notATextField:
            return "Focused element is not a text field"
        case .permissionDenied:
            return "Accessibility permission denied"
        case .invalidInput:
            return "Invalid input provided"
        case .axError(let message):
            return "AX Error: \(message)"
        }
    }
}

// MARK: - Response Types
struct StyloResponse {
    let success: Bool
    let data: String?
    let error: String?
    
    func toJSON() -> String {
        let dict: [String: Any] = [
            "success": success,
            "data": data ?? "",
            "error": error ?? ""
        ]
        
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: dict, options: [])
            return String(data: jsonData, encoding: .utf8) ?? "{}"
        } catch {
            return "{\"success\":false,\"error\":\"JSON serialization failed\"}"
        }
    }
}

// MARK: - Main Bridge Class
class StyloBridge {
    
    // MARK: - Permission Checking
    static func checkAccessibilityPermission() -> Bool {
        let options: NSDictionary = [kAXTrustedCheckOptionPrompt.takeRetainedValue(): false]
        return AXIsProcessTrustedWithOptions(options)
    }
    
    static func checkInputMonitoringPermission() -> Bool {
        // Input monitoring permission check
        // Note: This is a simplified check - actual implementation would require more complex logic
        return true // Placeholder - will be implemented properly
    }
    
    static func checkScreenRecordingPermission() -> Bool {
        // Screen recording permission check
        // Note: This is a simplified check - actual implementation would require more complex logic
        return true // Placeholder - will be implemented properly
    }
    
    // MARK: - AX Functions
    static func getFocusedTextValue() -> StyloResponse {
        // Check accessibility permission first
        guard checkAccessibilityPermission() else {
            return StyloResponse(success: false, data: nil, error: "Accessibility permission denied")
        }
        
        // Get the focused UI element
        var focusedElement: CFTypeRef?
        let result = AXUIElementCopyAttributeValue(AXUIElementCreateSystemWide(), kAXFocusedUIElementAttribute as CFString, &focusedElement)
        
        guard result == .success, let element = focusedElement else {
            return StyloResponse(success: false, data: nil, error: "No focused element found")
        }
        
        let focusedAXElement = element as! AXUIElement
        
        // Check if it's a text field
        var role: CFTypeRef?
        let roleResult = AXUIElementCopyAttributeValue(focusedAXElement, kAXRoleAttribute as CFString, &role)
        
        guard roleResult == .success, let roleString = role as? String,
              ["AXTextField", "AXTextArea", "AXStaticText", "AXWebArea"].contains(roleString) else {
            return StyloResponse(success: false, data: nil, error: "Focused element is not a text field")
        }
        
        // Get the value
        var value: CFTypeRef?
        let valueResult = AXUIElementCopyAttributeValue(focusedAXElement, kAXValueAttribute as CFString, &value)
        
        guard valueResult == .success, let valueString = value as? String else {
            return StyloResponse(success: false, data: nil, error: "Could not read text value")
        }
        
        return StyloResponse(success: true, data: valueString, error: nil)
    }
    
    static func setFocusedTextValue(_ newValue: String) -> StyloResponse {
        // Check accessibility permission first
        guard checkAccessibilityPermission() else {
            return StyloResponse(success: false, data: nil, error: "Accessibility permission denied")
        }
        
        // Get the focused UI element
        var focusedElement: CFTypeRef?
        let result = AXUIElementCopyAttributeValue(AXUIElementCreateSystemWide(), kAXFocusedUIElementAttribute as CFString, &focusedElement)
        
        guard result == .success, let element = focusedElement else {
            return StyloResponse(success: false, data: nil, error: "No focused element found")
        }
        
        let focusedAXElement = element as! AXUIElement
        
        // Check if it's a text field
        var role: CFTypeRef?
        let roleResult = AXUIElementCopyAttributeValue(focusedAXElement, kAXRoleAttribute as CFString, &role)
        
        guard roleResult == .success, let roleString = role as? String,
              ["AXTextField", "AXTextArea", "AXStaticText", "AXWebArea"].contains(roleString) else {
            return StyloResponse(success: false, data: nil, error: "Focused element is not a text field")
        }
        
        // Set the value
        let setResult = AXUIElementSetAttributeValue(focusedAXElement, kAXValueAttribute as CFString, newValue as CFTypeRef)
        if setResult != .success {
            return StyloResponse(success: false, data: nil, error: "Failed to set text value: \(setResult.rawValue)")
        }
        
        return StyloResponse(success: true, data: newValue, error: nil)
    }
    
    // MARK: - Permission Status
    static func getPermissionStatus() -> StyloResponse {
        let status = [
            "accessibility": checkAccessibilityPermission(),
            "inputMonitoring": checkInputMonitoringPermission(),
            "screenRecording": checkScreenRecordingPermission()
        ]
        
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: status, options: [])
            let jsonString = String(data: jsonData, encoding: .utf8) ?? "{}"
            return StyloResponse(success: true, data: jsonString, error: nil)
        } catch {
            return StyloResponse(success: false, data: nil, error: "Failed to serialize permission status")
        }
    }
}

// MARK: - Command Line Interface
func main() {
    let arguments = CommandLine.arguments
    
    guard arguments.count >= 2 else {
        print("Usage: StyloBridge <command> [args...]")
        exit(1)
    }
    
    let command = arguments[1]
    var response: StyloResponse
    
    switch command {
    case "getFocusedTextValue":
        response = StyloBridge.getFocusedTextValue()
        
    case "setFocusedTextValue":
        if arguments.count >= 3 {
            response = StyloBridge.setFocusedTextValue(arguments[2])
        } else {
            response = StyloResponse(success: false, data: nil, error: "Missing text value argument")
        }
        
    case "checkPermissions":
        response = StyloBridge.getPermissionStatus()
        
    case "checkAccessibility":
        let hasPermission = StyloBridge.checkAccessibilityPermission()
        response = StyloResponse(success: hasPermission, data: nil, error: hasPermission ? nil : "Accessibility permission denied")
        
    case "checkInputMonitoring":
        let hasPermission = StyloBridge.checkInputMonitoringPermission()
        response = StyloResponse(success: hasPermission, data: nil, error: hasPermission ? nil : "Input monitoring permission denied")
        
    case "checkScreenRecording":
        let hasPermission = StyloBridge.checkScreenRecordingPermission()
        response = StyloResponse(success: hasPermission, data: nil, error: hasPermission ? nil : "Screen recording permission denied")
        
    default:
        response = StyloResponse(success: false, data: nil, error: "Unknown command: \(command)")
    }
    
    print(response.toJSON())
}

// Run the main function
main()
