use serde::Serialize;
use windows::core::BOOL;
use windows::Win32::Foundation::{HWND, LPARAM, RECT};
use windows::Win32::Graphics::Dwm::{DwmGetWindowAttribute, DWMWA_EXTENDED_FRAME_BOUNDS};
use windows::Win32::UI::WindowsAndMessaging::{
    BringWindowToTop, EnumWindows, GetForegroundWindow, GetWindowRect, GetWindowTextLengthW,
    GetWindowTextW, GetWindowThreadProcessId, IsIconic, IsWindow, IsWindowVisible,
    SetForegroundWindow, ShowWindow, SW_RESTORE,
};

#[derive(Serialize)]
struct WindowInfo {
    window_id: u64,
    pid: u32,
    title: String,
    x: i32,
    y: i32,
    width: i32,
    height: i32,
}

#[derive(Clone)]
struct WindowSnapshot {
    hwnd: HWND,
    pid: u32,
    title: String,
    rect: RECT,
}

struct EnumState {
    pid: u32,
    windows: Vec<WindowSnapshot>,
}

unsafe extern "system" fn enum_windows_proc(hwnd: HWND, lparam: LPARAM) -> BOOL {
    let state = unsafe { &mut *(lparam.0 as *mut EnumState) };

    if !unsafe { IsWindowVisible(hwnd).as_bool() } {
        return BOOL(1);
    }

    let mut pid = 0u32;
    unsafe {
        GetWindowThreadProcessId(hwnd, Some(&mut pid));
    }

    if pid != state.pid {
        return BOOL(1);
    }

    if let Some(snapshot) = inspect_window(hwnd) {
        state.windows.push(snapshot);
    }

    BOOL(1)
}

fn inspect_window(hwnd: HWND) -> Option<WindowSnapshot> {
    if !unsafe { IsWindow(Some(hwnd)).as_bool() } {
        return None;
    }

    let mut pid = 0u32;
    unsafe {
        GetWindowThreadProcessId(hwnd, Some(&mut pid));
    }

    let title = get_window_title(hwnd);
    if title.trim().is_empty() {
        return None;
    }

    let rect = get_window_rect(hwnd)?;

    Some(WindowSnapshot {
        hwnd,
        pid,
        title,
        rect,
    })
}

fn get_window_title(hwnd: HWND) -> String {
    let len = unsafe { GetWindowTextLengthW(hwnd) };
    if len <= 0 {
        return String::new();
    }

    let mut buffer = vec![0u16; len as usize + 1];
    let written = unsafe { GetWindowTextW(hwnd, &mut buffer) };
    String::from_utf16_lossy(&buffer[..written as usize])
}

fn get_window_rect(hwnd: HWND) -> Option<RECT> {
    let mut rect = RECT::default();
    let dwm_result = unsafe {
        DwmGetWindowAttribute(
            hwnd,
            DWMWA_EXTENDED_FRAME_BOUNDS,
            &mut rect as *mut _ as *mut _,
            std::mem::size_of::<RECT>() as u32,
        )
    };

    if dwm_result.is_ok() {
        return Some(rect);
    }

    if unsafe { GetWindowRect(hwnd, &mut rect).is_ok() } {
        return Some(rect);
    }

    None
}

fn to_window_info(snapshot: WindowSnapshot) -> WindowInfo {
    WindowInfo {
        window_id: snapshot.hwnd.0 as usize as u64,
        pid: snapshot.pid,
        title: snapshot.title,
        x: snapshot.rect.left,
        y: snapshot.rect.top,
        width: snapshot.rect.right - snapshot.rect.left,
        height: snapshot.rect.bottom - snapshot.rect.top,
    }
}

fn print_focus_result(success: bool, stage: Option<&str>, snapshot: WindowSnapshot) {
    let info = to_window_info(snapshot);

    match stage {
        Some(stage) => println!(
            "{{\"success\":{},\"stage\":\"{}\",\"window_id\":{},\"pid\":{},\"title\":{},\"x\":{},\"y\":{},\"width\":{},\"height\":{}}}",
            success,
            stage,
            info.window_id,
            info.pid,
            serde_json::to_string(&info.title).unwrap(),
            info.x,
            info.y,
            info.width,
            info.height
        ),
        None => println!("{}", serde_json::to_string(&serde_json::json!({
            "success": success,
            "window_id": info.window_id,
            "pid": info.pid,
            "title": info.title,
            "x": info.x,
            "y": info.y,
            "width": info.width,
            "height": info.height,
        })).unwrap()),
    }
}

fn get_snapshot_by_hwnd(window_id: u64) -> Option<WindowSnapshot> {
    let handle = isize::try_from(window_id).ok()?;
    let hwnd = HWND(handle as usize as *mut core::ffi::c_void);
    inspect_window(hwnd)
}

pub fn get_windows(pid: u32) {
    let mut state = EnumState {
        pid,
        windows: Vec::new(),
    };

    unsafe {
        let state_ptr = &mut state as *mut EnumState;
        let _ = EnumWindows(Some(enum_windows_proc), LPARAM(state_ptr as isize));
    }

    let result: Vec<WindowInfo> = state.windows.into_iter().map(to_window_info).collect();
    println!("{}", serde_json::to_string(&result).unwrap());
}

pub fn get_window_by_id(window_id: u64) {
    match get_snapshot_by_hwnd(window_id) {
        Some(snapshot) => println!("{}", serde_json::to_string(&to_window_info(snapshot)).unwrap()),
        None => println!("null"),
    }
}

pub fn focus_window_by_id(window_id: u64) {
    let Some(snapshot) = get_snapshot_by_hwnd(window_id) else {
        println!(
            "{{\"success\":false,\"stage\":\"window_not_found\",\"window_id\":{}}}",
            window_id
        );
        return;
    };

    if unsafe { IsIconic(snapshot.hwnd).as_bool() } {
        unsafe {
            let _ = ShowWindow(snapshot.hwnd, SW_RESTORE);
        }
    }

    unsafe {
        let _ = BringWindowToTop(snapshot.hwnd);
    }
    let focused = unsafe { SetForegroundWindow(snapshot.hwnd).as_bool() };
    let is_foreground = unsafe { GetForegroundWindow() == snapshot.hwnd };

    if focused || is_foreground {
        print_focus_result(true, None, snapshot);
        return;
    }

    print_focus_result(false, Some("focus_failed"), snapshot);
}

