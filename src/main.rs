#[cfg(target_os = "macos")]
mod mac;

use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() < 3 {
        eprintln!("Usage:");
        eprintln!("  cross-window get-windows <pid>");
        return;
    }

    match args[1].as_str() {
        "get-windows" => {
            let pid: u32 = args[2].parse().expect("Invalid PID");
            get_windows(pid);
        }
        "focus" => {
            let pid: u32 = args[2].parse().expect("Invalid PID");
            let title = &args[3];
            mac::focus_window(pid, title);
        }
        _ => {
            eprintln!("Unknown command");
        }
    }
}

fn get_windows(pid: u32) {
    #[cfg(target_os = "macos")]
    mac::get_windows(pid);
}
