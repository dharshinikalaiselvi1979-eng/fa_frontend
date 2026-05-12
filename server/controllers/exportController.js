const Expense = require("../models/Expense");
const { createObjectCsvStringifier } = require("csv-writer");
const PDFDocument = require("pdfkit");

// @desc    Export expenses to CSV
// @route   GET /api/export/csv
// @access  Private
const exportCSV = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: "date", title: "Date" },
        { id: "title", title: "Title" },
        { id: "category", title: "Category" },
        { id: "amount", title: "Amount" },
        { id: "paymentMethod", title: "Payment Method" }
      ]
    });

    const records = expenses.map(exp => ({
      date: exp.date.toISOString().split("T")[0],
      title: exp.title,
      category: exp.category,
      amount: exp.amount,
      paymentMethod: exp.paymentMethod
    }));

    const header = csvStringifier.getHeaderString();
    const body = csvStringifier.stringifyRecords(records);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=expenses.csv");
    res.status(200).send(header + body);
  } catch (error) {
    next(error);
  }
};

// @desc    Export expenses to PDF
// @route   GET /api/export/pdf
// @access  Private
const exportPDF = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });

    const doc = new PDFDocument();
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=expenses.pdf");
    
    doc.pipe(res);

    doc.fontSize(20).text("FIN AI - Expense Report", { align: "center" });
    doc.moveDown();

    let total = 0;
    expenses.forEach(exp => {
      doc.fontSize(12).text(`${exp.date.toISOString().split("T")[0]} | ${exp.category} | ${exp.title}: $${exp.amount}`);
      total += exp.amount;
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total Spending: $${total}`, { align: "right" });

    doc.end();
  } catch (error) {
    next(error);
  }
};

module.exports = { exportCSV, exportPDF };
