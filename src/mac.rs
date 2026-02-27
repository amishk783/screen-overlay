use core_foundation::{
    array::{CFArray, CFArrayRef},
    base::{CFTypeRef, TCFType},
    boolean::CFBoolean,
    string::CFString,
};

use std::{ffi::c_void, ptr};

type AXUIElementRef = *const c_void;
type AXError = i32;

#[link(name = "ApplicationServices", kind = "framework")]
unsafe extern "C" {
    fn AXUIElementCreateApplication(pid: i32) -> AXUIElementRef;

    fn AXUIElementCopyAttributeValue(
        element: AXUIElementRef,
        attribute: CFTypeRef,
        value: *mut CFTypeRef,
    ) -> AXError;

    fn AXUIElementSetAttributeValue(
        element: AXUIElementRef,
        attribute: CFTypeRef,
        value: CFTypeRef,
    ) -> AXError;
}

pub fn get_windows(pid: u32) {
    unsafe {
        let app = AXUIElementCreateApplication(pid as i32);

        if app.is_null() {
            eprintln!("Failed to create AX application element");
            return;
        }

        let windows_attr = CFString::new("AXWindows");
        let mut windows_ref: CFTypeRef = ptr::null_mut();

        let result = AXUIElementCopyAttributeValue(
            app,
            windows_attr.as_concrete_TypeRef() as CFTypeRef,
            &mut windows_ref,
        );

        if result != 0 || windows_ref.is_null() {
            eprintln!("Failed to get AXWindows. Check Accessibility permission.");
            return;
        }

        let windows =
            CFArray::<CFTypeRef>::wrap_under_create_rule(windows_ref as CFArrayRef);

        println!("Found {} windows:", windows.len());

        for i in 0..windows.len() {
            let window_ref: CFTypeRef = *windows.get(i).unwrap();

            let title_attr = CFString::new("AXTitle");
            let mut title_ref: CFTypeRef = ptr::null_mut();

            let title_result = AXUIElementCopyAttributeValue(
                window_ref as AXUIElementRef,
                title_attr.as_concrete_TypeRef() as CFTypeRef,
                &mut title_ref,
            );

            if title_result == 0 && !title_ref.is_null() {
                let title_cf =
                    CFString::wrap_under_create_rule(title_ref as _);

                println!("Window {}: {}", i, title_cf.to_string());
            }
        }
    }
}

pub fn focus_window(pid: u32, target_title: &str) {
    unsafe {
        let app = AXUIElementCreateApplication(pid as i32);

        if app.is_null() {
            eprintln!("Failed to create AX application element");
            return;
        }

        let windows_attr = CFString::new("AXWindows");
        let mut windows_ref: CFTypeRef = ptr::null_mut();

        let result = AXUIElementCopyAttributeValue(
            app,
            windows_attr.as_concrete_TypeRef() as CFTypeRef,
            &mut windows_ref,
        );

        if result != 0 || windows_ref.is_null() {
            eprintln!("Failed to get AXWindows");
            return;
        }

        let windows =
            CFArray::<CFTypeRef>::wrap_under_create_rule(windows_ref as CFArrayRef);

        for i in 0..windows.len() {
            let window_ref: CFTypeRef = *windows.get(i).unwrap();

            let title_attr = CFString::new("AXTitle");
            let mut title_ref: CFTypeRef = ptr::null_mut();

            let title_result = AXUIElementCopyAttributeValue(
                window_ref as AXUIElementRef,
                title_attr.as_concrete_TypeRef() as CFTypeRef,
                &mut title_ref,
            );

            if title_result == 0 && !title_ref.is_null() {
                let title_cf =
                    CFString::wrap_under_create_rule(title_ref as _);

                let title = title_cf.to_string();

                if title == target_title {
                    println!("Focusing window: {}", title);

                    let true_value = CFBoolean::true_value();

                    let main_attr = CFString::new("AXMain");
                    AXUIElementSetAttributeValue(
                        window_ref as AXUIElementRef,
                        main_attr.as_concrete_TypeRef() as CFTypeRef,
                        true_value.as_concrete_TypeRef() as CFTypeRef,
                    );

                    let focused_attr = CFString::new("AXFocused");
                    AXUIElementSetAttributeValue(
                        window_ref as AXUIElementRef,
                        focused_attr.as_concrete_TypeRef() as CFTypeRef,
                        true_value.as_concrete_TypeRef() as CFTypeRef,
                    );

                    println!("Focus applied");
                    return;
                }
            }
        }

        eprintln!("Window with title '{}' not found", target_title);
    }
}