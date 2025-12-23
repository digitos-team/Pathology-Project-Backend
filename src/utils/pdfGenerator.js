export const generateExpenseReportPDF = (doc, reportData, type, year, month) => {
    // Header
    doc.fontSize(20).text("Expense Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Report Type: ${type.toUpperCase()}`);
    doc.text(`Year: ${year}`);
    if (month) doc.text(`Month: ${month}`);
    doc.moveDown();

    // Summary Table Header
    doc.fontSize(14).text("Summary", { underline: true });
    doc.moveDown(0.5);

    let grandTotal = 0;

    // Iterate through report data (Grouped by Day or Month)
    reportData.forEach((group) => {
        const timeUnit = group._id; // Day or Month

        doc.fontSize(12).font('Helvetica-Bold').text(`Period: ${timeUnit}`);

        group.categories.forEach(cat => {
            doc.font('Helvetica').text(`  - ${cat.category}: ${cat.totalAmount} (Count: ${cat.count})`);
            grandTotal += cat.totalAmount;

            // List items if monthly (Detailed view)
            if (type === 'monthly' && cat.items && cat.items.length > 0) {
                cat.items.forEach(item => {
                    doc.fontSize(10).text(`      * ${item.date.toISOString().split('T')[0]} - ${item.title}: ${item.amount}`, { textIndent: 20, color: 'gray' });
                });
                doc.fillColor('black'); // Reset color
                doc.fontSize(12);
            }
        });
        doc.moveDown(0.5);
    });

    doc.moveDown();
    doc.fontSize(14).font('Helvetica-Bold').text(`Grand Total: ${grandTotal}`, { align: "right" });
};
