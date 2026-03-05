#[cfg(target_os = "macos")]
mod mac;

use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() < 2 {
        eprintln!("Usage:");
        eprintln!("  cross-window get-windows <pid>");
        eprintln!("  cross-window get-window-by-id <window_id>");
        eprintln!("  cross-window focus <window_id>");
        return;
    }

    match args[1].as_str() {
        "get-windows" => {
            if args.len() < 3 {
                eprintln!("Usage: cross-window get-windows <pid>");
                return;
            }
            let pid: u32 = match args[2].parse() {
                Ok(v) => v,
                Err(_) => {
                    eprintln!("Invalid PID: {}", args[2]);
                    return;
                }
            };
            get_windows(pid);
        }
        "get-window-by-id" => {
            if args.len() < 3 {
                eprintln!("Usage: cross-window get-window-by-id <window_id>");
                return;
            }
            let window_id: u32 = match args[2].parse() {
                Ok(v) => v,
                Err(_) => {
                    eprintln!("Invalid window ID: {}", args[2]);
                    return;
                }
            };
            get_window_by_id(window_id);
        }
        "focus" => {
            if args.len() < 3 {
                eprintln!("Usage: cross-window focus <window_id>");
                return;
            }
            let window_id: u32 = match args[2].parse() {
                Ok(v) => v,
                Err(_) => {
                    eprintln!("Invalid window ID: {}", args[2]);
                    return;
                }
            };
            focus(window_id);
        }
        cmd => {
            eprintln!("Unknown command: {cmd}");
        }
    }
}

fn get_windows(pid: u32) {
    #[cfg(target_os = "macos")]
    mac::get_windows(pid);

    #[cfg(not(target_os = "macos"))]
    {
        let _ = pid;
        eprintln!("cross-window: get-windows is not supported on this platform");
        println!("[]");
    }
}

fn get_window_by_id(window_id: u32) {
    #[cfg(target_os = "macos")]
    mac::get_window_by_id(window_id);

    #[cfg(not(target_os = "macos"))]
    {
        let _ = window_id;
        eprintln!("cross-window: get-window-by-id is not supported on this platform");
        println!("null");
    }
}

fn focus(window_id: u32) {
    #[cfg(target_os = "macos")]
    mac::focus_window_by_id(window_id);

    #[cfg(not(target_os = "macos"))]
    {
        let _ = window_id;
        eprintln!("cross-window: focus is not supported on this platform");
        println!("{{\"success\":false,\"stage\":\"unsupported_platform\"}}");
    }
}
