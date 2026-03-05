use core_foundation::{
    array::{CFArray, CFArrayRef},
    base::{CFTypeRef, TCFType},
    boolean::CFBoolean,
    dictionary::CFDictionaryRef,
    number::CFNumberRef,
    string::CFString,
};
use serde::Serialize;
use std::{ffi::c_void, ptr};

type AXUIElementRef = *const c_void;
type AXError = i32;

#[derive(Serialize)]
struct WindowInfo {
    window_id: u32,
    pid: u32,
    title: String,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
}
#[repr(C)]
struct CGPoint {
    x: f64,
    y: f64,
}

#[repr(C)]
struct CGSize {
    width: f64,
    height: f64,
}

const K_AXVALUE_CGPOINT_TYPE: i32 = 1;
const K_AXVALUE_CGSIZE_TYPE: i32 = 2;
const KCG_WINDOW_LIST_OPTION_ALL: u32 = 0;
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

    fn AXValueGetValue(value: CFTypeRef, value_type: i32, data: *mut c_void) -> bool;
    fn CGWindowListCopyWindowInfo(option: u32, relative_to_window: u32) -> CFArrayRef;
}

pub fn get_windows(pid: u32) {
    unsafe {
        let app = AXUIElementCreateApplication(pid as i32);

        if app.is_null() {
            println!("[]");
            return;
        }

        let windows_attr = CFString::new("AXWindows");
        let mut windows_ref: CFTypeRef = ptr::null_mut();

        if AXUIElementCopyAttributeValue(
            app,
            windows_attr.as_concrete_TypeRef() as CFTypeRef,
            &mut windows_ref,
        ) != 0
            || windows_ref.is_null()
        {
            println!("[]");
            return;
        }

        let windows = CFArray::<CFTypeRef>::wrap_under_create_rule(windows_ref as CFArrayRef);

        let mut result: Vec<WindowInfo> = Vec::new();

        for i in 0..windows.len() {
            let window_ref: CFTypeRef = *windows.get(i).unwrap();

            // ---- TITLE ----
            let title_attr = CFString::new("AXTitle");
            let mut title_ref: CFTypeRef = ptr::null_mut();

            let title = if AXUIElementCopyAttributeValue(
                window_ref as AXUIElementRef,
                title_attr.as_concrete_TypeRef() as CFTypeRef,
                &mut title_ref,
            ) == 0
                && !title_ref.is_null()
            {
                let title_cf = CFString::wrap_under_create_rule(title_ref as _);
                title_cf.to_string()
            } else {
                continue;
            };

            // ---- POSITION ----
            let position_attr = CFString::new("AXPosition");
            let mut position_ref: CFTypeRef = ptr::null_mut();

            let mut x = 0.0;
            let mut y = 0.0;

            if AXUIElementCopyAttributeValue(
                window_ref as AXUIElementRef,
                position_attr.as_concrete_TypeRef() as CFTypeRef,
                &mut position_ref,
            ) == 0
                && !position_ref.is_null()
            {
                let mut point = CGPoint { x: 0.0, y: 0.0 };

                if AXValueGetValue(
                    position_ref,
                    K_AXVALUE_CGPOINT_TYPE,
                    &mut point as *mut _ as *mut c_void,
                ) {
                    x = point.x;
                    y = point.y;
                }
            }

            // ---- SIZE ----
            let size_attr = CFString::new("AXSize");
            let mut size_ref: CFTypeRef = ptr::null_mut();

            let mut width = 0.0;
            let mut height = 0.0;

            if AXUIElementCopyAttributeValue(
                window_ref as AXUIElementRef,
                size_attr.as_concrete_TypeRef() as CFTypeRef,
                &mut size_ref,
            ) == 0
                && !size_ref.is_null()
            {
                let mut size = CGSize {
                    width: 0.0,
                    height: 0.0,
                };

                if AXValueGetValue(
                    size_ref,
                    K_AXVALUE_CGSIZE_TYPE,
                    &mut size as *mut _ as *mut c_void,
                ) {
                    width = size.width;
                    height = size.height;
                }
            }

            result.push(WindowInfo {
                window_id: 0,
                pid,
                title,
                x,
                y,
                width,
                height,
            });
        }

        println!("{}", serde_json::to_string(&result).unwrap());
    }
}
pub fn get_window_by_id(target_window_id: u32) {
    unsafe {
        let window_list = CGWindowListCopyWindowInfo(KCG_WINDOW_LIST_OPTION_ALL, 0);

        if window_list.is_null() {
            println!("null");
            return;
        }

        let array = CFArray::<CFTypeRef>::wrap_under_create_rule(window_list);

        for i in 0..array.len() {
            let dict_ref: CFDictionaryRef =
                *array.get(i).unwrap() as CFDictionaryRef;

            let window_id = get_u32_from_dict(dict_ref, "kCGWindowNumber");

            if window_id != target_window_id {
                continue;
            }

            let pid = get_u32_from_dict(dict_ref, "kCGWindowOwnerPID");
            let title = get_string_from_dict(dict_ref, "kCGWindowName");
            let (x, y, width, height) =
                get_bounds_from_dict(dict_ref, "kCGWindowBounds");

            let result = WindowInfo {
                window_id,
                pid,
                title,
                x,
                y,
                width,
                height,
            };

            println!("{}", serde_json::to_string(&result).unwrap());
            return;
        }

        println!("null");
    }
}
unsafe fn get_u32_from_dict(dict: CFDictionaryRef, key: &str) -> u32 {
    use core_foundation::dictionary::CFDictionaryGetValue;

    let key_cf = CFString::new(key);

    let value = unsafe {
        CFDictionaryGetValue(
            dict,
            key_cf.as_concrete_TypeRef() as *const _,
        )
    };

    if value.is_null() {
        return 0;
    }

    let number = value as CFNumberRef;
    let mut result: i32 = 0;

    unsafe {
        core_foundation::number::CFNumberGetValue(
            number,
            core_foundation::number::kCFNumberSInt32Type,
            &mut result as *mut _ as *mut _,
        );
    }

    result as u32
}

unsafe fn get_string_from_dict(dict: CFDictionaryRef, key: &str) -> String {
    use core_foundation::dictionary::CFDictionaryGetValue;

    let key_cf = CFString::new(key);

    let value = unsafe {
        CFDictionaryGetValue(
            dict,
            key_cf.as_concrete_TypeRef() as *const _,
        )
    };

    if value.is_null() {
        return String::new();
    }

    let cf_string = unsafe {
        CFString::wrap_under_get_rule(value as _)
    };

    cf_string.to_string()
}

unsafe fn get_bounds_from_dict(
    dict: CFDictionaryRef,
    key: &str,
) -> (f64, f64, f64, f64) {
    use core_foundation::dictionary::CFDictionaryGetValue;

    let key_cf = CFString::new(key);

    let bounds_dict_ref = unsafe {
        CFDictionaryGetValue(
            dict,
            key_cf.as_concrete_TypeRef() as *const _,
        ) as CFDictionaryRef
    };

    if bounds_dict_ref.is_null() {
        return (0.0, 0.0, 0.0, 0.0);
    }

    let x = get_u32_from_dict(bounds_dict_ref, "X") as f64;
    let y = get_u32_from_dict(bounds_dict_ref, "Y") as f64;
    let width = get_u32_from_dict(bounds_dict_ref, "Width") as f64;
    let height = get_u32_from_dict(bounds_dict_ref, "Height") as f64;

    (x, y, width, height)
}


pub fn focus_window(pid: u32, target_title: &str) {
    unsafe {
        let app = AXUIElementCreateApplication(pid as i32);

        if app.is_null() {
            println!(r#"{{"success":false}}"#);
            return;
        }

        let windows_attr = CFString::new("AXWindows");
        let mut windows_ref: CFTypeRef = ptr::null_mut();

        if AXUIElementCopyAttributeValue(
            app,
            windows_attr.as_concrete_TypeRef() as CFTypeRef,
            &mut windows_ref,
        ) != 0
            || windows_ref.is_null()
        {
            println!(r#"{{"success":false}}"#);
            return;
        }

        let windows = CFArray::<CFTypeRef>::wrap_under_create_rule(windows_ref as CFArrayRef);

        for i in 0..windows.len() {
            let window_ref: CFTypeRef = *windows.get(i).unwrap();

            let title_attr = CFString::new("AXTitle");
            let mut title_ref: CFTypeRef = ptr::null_mut();

            if AXUIElementCopyAttributeValue(
                window_ref as AXUIElementRef,
                title_attr.as_concrete_TypeRef() as CFTypeRef,
                &mut title_ref,
            ) == 0
                && !title_ref.is_null()
            {
                let title_cf = CFString::wrap_under_create_rule(title_ref as _);
                let title = title_cf.to_string();

                if title == target_title {
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

                    println!(r#"{{"success":true}}"#);
                    return;
                }
            }
        }

        println!(r#"{{"success":false}}"#);
    }
}

pub fn focus_window_by_id(target_window_id: u32) {
    unsafe {
        let window_list = CGWindowListCopyWindowInfo(KCG_WINDOW_LIST_OPTION_ALL, 0);

        if window_list.is_null() {
            println!("{}", r#"{"success":false,"stage":"cg_window_list_null"}"#);
            return;
        }

        let array = CFArray::<CFTypeRef>::wrap_under_create_rule(window_list);

        let mut pid: u32 = 0;
        let mut target_title = String::new();

        for i in 0..array.len() {
            let dict_ref: CFDictionaryRef =
                *array.get(i).unwrap() as CFDictionaryRef;

            let window_id = get_u32_from_dict(dict_ref, "kCGWindowNumber");

            if window_id != target_window_id {
                continue;
            }

            pid = get_u32_from_dict(dict_ref, "kCGWindowOwnerPID");
            target_title = get_string_from_dict(dict_ref, "kCGWindowName");
            break;
        }

        if pid == 0 {
            println!(
                "{}",
                format!(
                    r#"{{"success":false,"stage":"window_not_found","window_id":{}}}"#,
                    target_window_id
                )
            );
            return;
        }

        let app = AXUIElementCreateApplication(pid as i32);

        if app.is_null() {
            println!(
                "{}",
                format!(
                    r#"{{"success":false,"stage":"ax_app_null","pid":{}}}"#,
                    pid
                )
            );
            return;
        }

        let windows_attr = CFString::new("AXWindows");
        let mut windows_ref: CFTypeRef = ptr::null_mut();

        if AXUIElementCopyAttributeValue(
            app,
            windows_attr.as_concrete_TypeRef() as CFTypeRef,
            &mut windows_ref,
        ) != 0 || windows_ref.is_null()
        {
            println!(
                "{}",
                format!(
                    r#"{{"success":false,"stage":"ax_windows_fetch_failed","pid":{}}}"#,
                    pid
                )
            );
            return;
        }

        let windows =
            CFArray::<CFTypeRef>::wrap_under_create_rule(windows_ref as CFArrayRef);

        for i in 0..windows.len() {
            let window_ref: CFTypeRef = *windows.get(i).unwrap();

            let title_attr = CFString::new("AXTitle");
            let mut title_ref: CFTypeRef = ptr::null_mut();

            if AXUIElementCopyAttributeValue(
                window_ref as AXUIElementRef,
                title_attr.as_concrete_TypeRef() as CFTypeRef,
                &mut title_ref,
            ) == 0 && !title_ref.is_null()
            {
                let title_cf =
                    CFString::wrap_under_create_rule(title_ref as _);
                let title = title_cf.to_string();
                println!("AX title: {}", title);
                println!("Target title: {}", target_title);
                if title.contains(&target_title) || target_title.contains(&title)  {
                    let true_value = CFBoolean::true_value();

                    AXUIElementSetAttributeValue(
                        window_ref as AXUIElementRef,
                        CFString::new("AXMain").as_concrete_TypeRef() as CFTypeRef,
                        true_value.as_concrete_TypeRef() as CFTypeRef,
                    );

                    AXUIElementSetAttributeValue(
                        window_ref as AXUIElementRef,
                        CFString::new("AXFocused").as_concrete_TypeRef() as CFTypeRef,
                        true_value.as_concrete_TypeRef() as CFTypeRef,
                    );

                    println!(
                        "{}",
                        format!(
                            r#"{{"success":true,"window_id":{},"pid":{},"title":"{}"}}"#,
                            target_window_id, pid, title
                        )
                    );
                    return;
                }
            }
        }

        println!(
            "{}",
            format!(
                r#"{{"success":false,"stage":"ax_window_not_matched","window_id":{},"pid":{},"title":"{}"}}"#,
                target_window_id, pid, target_title
            )
        );
    }
}