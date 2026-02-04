import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateReport = (specs, storageResults, batteryStatus, extraData = {}) => {
    const { serial = 'N/A', technician = 'N/A', notes = '', qcResults = null } = extraData;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // -- HEADER --
    doc.setFillColor(10, 10, 10); // #0a0a0a
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(0, 255, 65); // Electric Green
    doc.setFont('courier', 'bold');
    doc.setFontSize(22);
    doc.text('HACKRORE DIAGNOSTICS', 14, 20);

    doc.setTextColor(200, 200, 200);
    doc.setFontSize(10);
    doc.text('CERTIFIED TECHNICIAN REPORT', 14, 30);

    doc.setTextColor(150, 150, 150);
    doc.text(`COMPLETION: ${new Date().toLocaleString()}`, pageWidth - 14, 20, { align: 'right' });
    doc.text(`SN: ${serial}`, pageWidth - 14, 30, { align: 'right' });
    doc.text(`Tech: ${technician}`, pageWidth - 14, 40, { align: 'right' });

    let yPos = 55;

    // -- QC CHECKLIST (If Available) --
    if (qcResults) {
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text('0. QC INSPECTION', 14, yPos);
        yPos += 10;

        const qcData = qcResults.map(r => [r.test, r.status]);
        doc.autoTable({
            startY: yPos,
            head: [['Inspection Point', 'Result']],
            body: qcData,
            theme: 'grid',
            headStyles: { fillColor: [10, 10, 10], textColor: [0, 255, 65] },
            styles: { fontSize: 10 }
        });
        yPos = doc.lastAutoTable.finalY + 20;
    }

    // -- SYSTEM SPECS --
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('1. SYSTEM IDENTIFICATION', 14, yPos);
    yPos += 10;

    const specData = [
        ['Platform', specs?.platform || 'Unknown'],
        ['Browser Engine', specs?.userAgent || 'Unknown'],
        ['Logical Cores', `${specs?.cores || '?'} Threads`],
        ['Screen Resolution', `${specs?.screen?.width}x${specs?.screen?.height}`],
    ];

    doc.autoTable({
        startY: yPos,
        head: [['Component', 'Detail']],
        body: specData,
        theme: 'grid',
        headStyles: { fillColor: [10, 10, 10], textColor: [0, 255, 65] },
    });

    yPos = doc.lastAutoTable.finalY + 20;

    // -- BATTERY HEALTH --
    if (batteryStatus) {
        doc.text('2. POWER MANAGEMENT', 14, yPos);
        yPos += 10;

        const healthVal = extraData.batteryAdvanced?.health
            ? `${extraData.batteryAdvanced.health}% (Advanced)`
            : 'Pending Analysis';

        const batData = [
            ['Battery Charge', `${Math.round(batteryStatus.level * 100)}%`],
            ['Charging Status', batteryStatus.charging ? 'Plugged In (AC)' : 'Discharging (DC)'],
            ['Calculated Health', healthVal]
        ];

        doc.autoTable({
            startY: yPos,
            head: [['Metric', 'Value']],
            body: batData,
            theme: 'grid',
            headStyles: { fillColor: [10, 10, 10], textColor: [0, 255, 65] },
        });

        yPos = doc.lastAutoTable.finalY + 15;
    }

    // ADVANCED BATTERY
    if (extraData.batteryAdvanced && extraData.batteryAdvanced.designCap) {
        const { designCap, fullCap, cycleCount, health } = extraData.batteryAdvanced;

        const advData = [
            ['Design Capacity', `${designCap} mWh`],
            ['Full Charge Cap', `${fullCap} mWh`],
            ['Health (Calculated)', `${health}%`],
            ['Cycle Count', cycleCount]
        ];

        if (health < 60 || cycleCount > 500) {
            advData.push(['RECOMMENDATION', 'REPLACE BATTERY']);
        }

        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('Advanced Power Analysis (powercfg)', 14, yPos);
        yPos += 5;

        doc.autoTable({
            startY: yPos,
            head: [['Deep Metric', 'Value']],
            body: advData,
            theme: 'grid',
            headStyles: { fillColor: [50, 50, 50], textColor: [255, 200, 0] }, // Yellow/Gold for Advanced
        });
        yPos = doc.lastAutoTable.finalY + 20;
    } else if (batteryStatus) {
        // Just spacer if no advanced data
        yPos += 10;
    } else {
        yPos += 10;
    }


    // -- STORAGE BENCHMARK --
    if (storageResults) {
        doc.text('3. STORAGE PERFORMANCE (BROWSER)', 14, yPos);
        yPos += 10;

        const storageData = [
            ['Read Speed', `${storageResults.readSpeed} MB/s`],
            ['Write Speed', `${storageResults.writeSpeed} MB/s`],
            ['Read Latency', `${storageResults.readLatency} ms`],
            ['Write Latency', `${storageResults.writeLatency} ms`],
        ];

        doc.autoTable({
            startY: yPos,
            head: [['Metric', 'Result']],
            body: storageData,
            theme: 'grid',
            headStyles: { fillColor: [10, 10, 10], textColor: [0, 255, 65] },
        });

        yPos = doc.lastAutoTable.finalY + 20;
    }

    // -- FOOTER / SIGN-OFF --
    yPos = Math.max(yPos, 220);
    doc.setDrawColor(150, 150, 150);
    doc.line(14, yPos, pageWidth - 14, yPos); // Line

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('TECHNICIAN SIGNATURE', 14, yPos + 10);

    if (extraData.signature) {
        // Embed signature image
        try {
            doc.addImage(extraData.signature, 'PNG', 14, yPos + 12, 50, 15);
        } catch (e) {
            console.error('Failed to add signature to PDF', e);
        }
    }

    doc.text('CUSTOMER SIGNATURE', pageWidth / 2 + 14, yPos + 10);

    // -- NOTES (If Available) --
    if (notes && notes.trim().length > 0) {
        doc.addPage();
        doc.setFillColor(10, 10, 10);
        doc.rect(0, 0, pageWidth, 20, 'F');
        doc.setTextColor(0, 255, 65);
        doc.setFontSize(14);
        doc.text('ADDITIONAL TECHNICIAN NOTES', 14, 13);

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const splitNotes = doc.splitTextToSize(notes, pageWidth - 28);
        doc.text(splitNotes, 14, 35);
    }

    // Save
    doc.save(`HackRore_Report_${serial}.pdf`);
};
