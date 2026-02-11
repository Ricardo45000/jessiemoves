import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateSessionReport = (sessionSummary, sequenceData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // --- COLORS ---
    const primaryColor = [233, 30, 99]; // Pink #e91e63
    const secondaryColor = [33, 150, 243]; // Blue #2196f3
    const darkBg = [26, 26, 46]; // Dark #1a1a2e (JessieMoves bg)
    const lightText = [240, 240, 240];
    const grayText = [100, 100, 100];

    // --- HEADER ---
    // Background Strip
    doc.setFillColor(...darkBg);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Logo Text "JessieMoves"
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...primaryColor);
    doc.text("JessieMoves", 20, 20);

    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text("AI Pilates Coach", 20, 28);

    // Title & Date
    doc.setFontSize(16);
    doc.text("Session Performance Report", pageWidth - 20, 20, { align: 'right' });
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(dateStr, pageWidth - 20, 28, { align: 'right' });


    // --- EXECUTIVE SUMMARY CARD ---
    let yPos = 55;

    // Draw Card Background
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(15, yPos, pageWidth - 30, 40, 3, 3, 'FD');

    // Global Score
    doc.setFontSize(32);
    doc.setTextColor(...(sessionSummary.globalScore >= 80 ? [76, 175, 80] : sessionSummary.globalScore >= 60 ? [255, 152, 0] : [244, 67, 54]));
    doc.text(`${sessionSummary.globalScore}`, 40, yPos + 22, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(...grayText);
    doc.text("Global Score", 40, yPos + 30, { align: 'center' });

    // Separator
    doc.setDrawColor(200, 200, 200);
    doc.line(70, yPos + 10, 70, yPos + 30);

    // Stats
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Poses: ${sessionSummary.totalPoses}`, 80, yPos + 18);
    doc.text(`Focus Area: ${sessionSummary.weakestIndicator || 'General Form'}`, 80, yPos + 28);

    // Feedback Quote with "Coach" icon feel
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...grayText);
    const feedbackLines = doc.splitTextToSize(`"${sessionSummary.feedback}"`, 90);
    doc.text(feedbackLines, pageWidth - 105, yPos + 18);

    yPos += 55;

    // --- REMEDIAL RECOMMENDATION ---
    if (sessionSummary.recommendation) {
        doc.setFillColor(255, 240, 245); // Light pink bg
        doc.setDrawColor(...primaryColor);
        doc.roundedRect(15, yPos, pageWidth - 30, 35, 3, 3, 'FD');

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...primaryColor);
        doc.text("RECOMMENDED FOR YOU", 25, yPos + 10);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(sessionSummary.recommendation.title, 25, yPos + 18);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...grayText);
        doc.text(sessionSummary.recommendation.description, 25, yPos + 26);

        // Link (Mock visual)
        doc.setTextColor(...secondaryColor);
        doc.textWithLink("Watch Remedial Tutorial", 160, yPos + 26, { url: sessionSummary.recommendation.media });

        yPos += 45;
    }

    // --- ADVANCED METRICS (Dynamic) ---
    if (sessionSummary.advancedMetrics) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("Advanced Session Metrics", 20, yPos);
        yPos += 15;

        // Metrics Configuration
        const metrics = [
            { label: 'Stability', score: sessionSummary.advancedMetrics.stability || 0, color: [33, 150, 243] }, // Blue
            { label: 'Endurance', score: sessionSummary.advancedMetrics.endurance || 0, color: [76, 175, 80] }, // Green
            { label: 'Fluidity', score: sessionSummary.advancedMetrics.fluidity || 0, color: [156, 39, 176] }, // Purple
            { label: 'Consistency', score: sessionSummary.advancedMetrics.consistency || 0, color: [255, 152, 0] } // Orange
        ];

        // Layout
        const margin = 30;
        const availableWidth = pageWidth - (margin * 2);
        const gap = availableWidth / 3; // space between 4 items

        metrics.forEach((m, i) => {
            const x = margin + (i * gap);

            // Draw Circle Background (Ring)
            doc.setDrawColor(230, 230, 230);
            doc.setLineWidth(1.5);
            doc.circle(x, yPos + 5, 14, 'S');

            // Draw Score Ring (Simulated Progress - Full circle for now as visual placeholder)
            // Ideally use arc() but jsPDF basic implementation is tricky. 
            // We'll just color the ring if score > 50
            if (m.score > 0) {
                doc.setDrawColor(...m.color);
                doc.setLineWidth(2);
                doc.circle(x, yPos + 5, 14, 'S');
            }

            // Score Number
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.setTextColor(...m.color);
            doc.text(`${m.score}`, x, yPos + 9, { align: 'center' });

            // Label
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(80, 80, 80);
            doc.text(m.label, x, yPos + 28, { align: 'center' });
        });

        yPos += 45;
    }

    // --- DETAILED TIMELINE TABLE ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Exercise Timeline", 20, yPos);
    yPos += 5;

    const tableData = sequenceData.map(item => [
        item.pose,
        `${item.duration_sec}s`,
        item.level || 'Novice',
        item.global_score || '-',
        item.feedback ? item.feedback.join('\n') : '-'
    ]);

    doc.autoTable({
        startY: yPos,
        head: [['Exercise', 'Duration', 'Level', 'Score', 'Feedback']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: darkBg,
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 35 },
            1: { cellWidth: 20 },
            2: { cellWidth: 25 },
            3: { halign: 'center', fontStyle: 'bold', cellWidth: 20 },
            4: { fontSize: 8, cellPadding: 3 }
        },
        alternateRowStyles: {
            fillColor: [250, 250, 250]
        },
        didParseCell: function (data) {
            // Color code the score column
            if (data.section === 'body' && data.column.index === 3) {
                const score = parseInt(data.cell.raw);
                if (score >= 80) data.cell.styles.textColor = [76, 175, 80];
                else if (score >= 60) data.cell.styles.textColor = [255, 152, 0];
                else data.cell.styles.textColor = [244, 67, 54];
            }
        }
    });

    // --- FOOTER ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`JessieMoves AI Report - Generated on ${dateStr}`, 15, pageHeight - 10);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
    }

    // Save
    doc.save(`JessieMoves_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
};
