export const TOOLBOX_DATA = [
    {
        category: "Hardware Diagnostics",
        id: "hardware",
        tools: [
            { name: "CPU-Z", url: "https://www.cpuid.com/softwares/cpu-z.html", desc: "Detailed information on CPU, Motherboard, and RAM." },
            { name: "CrystalDiskInfo", url: "https://crystalmark.info/en/software/crystaldiskinfo/", desc: "Health monitoring for SSDs and HDDs." },
            { name: "HWMonitor", url: "https://www.cpuid.com/softwares/hwmonitor.html", desc: "Real-time voltage, temperature, and fan speed monitor." },
            { name: "GPU-Z", url: "https://www.techpowerup.com/gpuz/", desc: "Graphics card details and sensor monitoring." },
            { name: "MemTest86+", url: "https://www.memtest86.com/", desc: "Industry standard for RAM testing via bootable USB." },
            { name: "HWiNFO", url: "https://www.hwinfo.com/", desc: "Comprehensive hardware analysis and monitoring." },
            { name: "MSI Afterburner", url: "https://www.msi.com/Landing/afterburner/graphics-cards", desc: "GPU overclocking and hardware monitoring." },
            { name: "Prime95", url: "https://www.mersenne.org/download/", desc: "CPU stress testing and system stability check." }
        ]
    },
    {
        category: "Software Diagnostics",
        id: "software",
        tools: [
            { name: "BlueScreenView", url: "http://www.nirsoft.net/utils/blue_screen_view.html", desc: "Scan and display information about BSOD minidumps." },
            { name: "WhoCrashed", url: "https://www.resplendence.com/whocrashed", desc: "Identify drivers responsible for system crashes." },
            { name: "Sysinternals Suite", url: "https://learn.microsoft.com/en-us/sysinternals/", desc: "Microsoft's complete set of advanced system utilities." },
            { name: "Process Explorer", url: "https://learn.microsoft.com/en-us/sysinternals/downloads/process-explorer", desc: "Advanced task manager with deep process inspection." },
            { name: "Autoruns", url: "https://learn.microsoft.com/en-us/sysinternals/downloads/autoruns", desc: "Manage programs that start automatically with Windows." }
        ]
    },
    {
        category: "Terminal Utilities",
        id: "terminal",
        commands: [
            { label: "File System Check", cmd: "chkdsk /f", desc: "Fix errors on the disk." },
            { label: "System File Scanner", cmd: "sfc /scannow", desc: "Repair corrupted Windows system files." },
            { label: "Image Repair (DISM)", cmd: "DISM /Online /Cleanup-Image /RestoreHealth", desc: "Repair Windows image via Windows Update." },
            { label: "Winsock Reset", cmd: "netsh winsock reset", desc: "Fix network socket errors." },
            { label: "IP Refresh", cmd: "ipconfig /renew", desc: "Renew current IP address leases." }
        ]
    },
    {
        category: "System Utilities",
        id: "utils",
        tools: [
            { name: "Ninite", url: "https://ninite.com/", desc: "Bulk install and update multiple apps at once." },
            { name: "Chocolatey", url: "https://chocolatey.org/", desc: "Package manager for Windows (command-line install)." },
            { name: "Snappy Driver Origin", url: "https://www.snappy-driver-installer.org/", desc: "Best-in-class driver installer for offline technicians." },
            { name: "WizTree", url: "https://wiztreefree.com/", desc: "Fastest disk space analyzer (find large files)." },
            { name: "Bulk Crap Uninstaller", url: "https://www.bcuninstaller.com/", desc: "Deep removal of software and leftover traces." }
        ]
    },
    {
        category: "Recovery & Boot",
        id: "boot",
        tools: [
            { name: "Medicat USB", url: "https://medicatusb.com/", desc: "The ultimate technician's bootable toolkit." },
            { name: "Hiren's BootCD PE", url: "https://www.hirensbootcd.org/", desc: "WinPE-based rescue environment for repair." },
            { name: "Ventoy", url: "https://www.ventoy.net/", desc: "Boot multiple ISOs from a single USB drive." },
            { name: "Rufus", url: "https://rufus.ie", desc: "Create bootable USB drives from ISOs." }
        ]
    },
    {
        category: "Security & Virus Removal",
        id: "security",
        tools: [
            { name: "Malwarebytes AdwCleaner", url: "https://www.malwarebytes.com/adwcleaner", desc: "Targeted removal of adware and PUPs." },
            { name: "Kaspersky KVRT", url: "https://www.kaspersky.com/downloads/free-virus-removal-tool", desc: "Single-run portable virus scanner." },
            { name: "HitmanPro", url: "https://www.hitmanpro.com/en-us/hmp", desc: "Second-opinion scanner for rootkits and malware." },
            { name: "Eset Online Scanner", url: "https://www.eset.com/int/home/online-scanner/", desc: "Powerful web-based malware scanner." }
        ]
    }
];
