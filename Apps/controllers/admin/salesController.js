const Order = require('../../models/orderModel');

const PDFDocument = require("pdfkit"); // For PDF generation
const ExcelJS = require("exceljs");

const salesController = {
  getSaleReport: async (req, res, next) => {
    try {
      let { startDate, endDate,  timeFilter } = req.query;

      // Base date setup
      let today = new Date();

      //resets the current date to midnight (00:00:00),
      today.setHours(0, 0, 0, 0);
      let startDateTime = new Date(today);
      let endDateTime = new Date();
      endDateTime.setHours(23, 59, 59, 999);

      // Time filter logic
      if (timeFilter) {
        switch (timeFilter) {
          case 'today':
            startDateTime = today;
            endDateTime = new Date();
            endDateTime.setHours(23, 59, 59, 999);
            break;
          case 'yesterday':
            startDateTime = new Date(today);
            startDateTime.setDate(startDateTime.getDate() - 1);
            endDateTime = new Date(today.getTime() - 1);
            break;
          case 'last7days':
            startDateTime = new Date(today);
            startDateTime.setDate(startDateTime.getDate() - 7);
            break;
          case 'last30days':
            startDateTime = new Date(today);
            startDateTime.setDate(startDateTime.getDate() - 30);
            break;
          case 'thisMonth':
            startDateTime = new Date(today.getFullYear(), today.getMonth(), 1);
            break;
          case 'lastMonth':
            startDateTime = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            endDateTime = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
            break;
          case 'custom':
            if (startDate && endDate) {
              startDateTime = new Date(startDate);
              endDateTime = new Date(endDate);
              endDateTime.setHours(23, 59, 59, 999);
            }
            break;
          default:
            startDateTime.setDate(startDateTime.getDate() - 30);
        }
      } else if (startDate && endDate) {
        startDateTime = new Date(startDate);
        endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        timeFilter = 'custom';
      } else {
        startDateTime.setDate(startDateTime.getDate() - 30);
        timeFilter = 'last30days';
      }

      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid date format." });
      }

    

      const query = { timestamp: { $gte: startDateTime, $lte: endDateTime } };

      // Fetch orders
      const allOrders = await Order.find(query)
        .populate('user', 'fullName email')
        

      const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const totalCouponPrice = allOrders.reduce((sum, order) => sum + (order.couponDiscount || 0), 0);
      const recentOrders = allOrders.slice(0, 10).map(order => ({
        orderId: order.orderId,
        user: order.user,
        email: order.user?.email || "N/A",
        timestamp: order.timestamp,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod
      }));

      res.status(200).render("dashboard", {
        success: true,
        totalRevenue,
        totalCouponPrice,
        totalOrders: allOrders.length,
        orders: recentOrders,
       
        timeFilter,
        startDate: startDateTime.toISOString().split('T')[0],
        endDate: endDateTime.toISOString().split('T')[0]
      });
    } catch (error) {
      console.error("Error fetching sales report:", error);
      next(error);
    }
  },
  downloadPDF: async (req, res, next) => {
    try {
      const salesData = req.body;

      if (!Array.isArray(salesData) || salesData.length === 0) {
        return res.status(400).json({ success: false, message: "No sales data available." });
      }

      const doc = new PDFDocument();
      res.setHeader("Content-Disposition", "attachment; filename=sales_report.pdf");
      res.setHeader("Content-Type", "application/pdf");

      doc.pipe(res);
      doc.fontSize(16).text("Sales Report", { align: "center" }).moveDown();

      salesData.forEach(sale => {
        doc.fontSize(12)
          .text(`Order ID: ${sale.orderId}`)
          .text(`Customer: ${sale.user?.fullName || "Guest"}`) // ✅ Fixed customer name
          .text(`Date: ${new Date(sale.timestamp).toLocaleDateString()}`)
          .text(`Total Amount: ₹${sale.totalAmount.toFixed(2)}`)
          .text(`Payment Method: ${sale.paymentMethod}`)
          .moveDown();
      });

      doc.fontSize(14).text(
        `Grand Total: ₹${salesData.reduce((sum, sale) => sum + sale.totalAmount, 0).toFixed(2)}`,
        { align: "right" }
      );
      doc.end();
    } catch (error) {
      console.error("Error generating PDF:", error);
      next(error);
    }
  },

  downloadEXCEL: async (req, res, next) => {
    try {
      const salesData = req.body;

      if (!Array.isArray(salesData) || salesData.length === 0) {
        return res.status(400).json({ success: false, message: "No sales data available." });
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sales Report");

      worksheet.columns = [
        { header: "Order ID", key: "orderId", width: 20 },
        { header: "Customer", key: "userFullName", width: 20 }, // ✅ Fixed customer name
        { header: "Date", key: "date", width: 15 },
        { header: "Total Amount (₹)", key: "totalAmount", width: 15 },
        { header: "Payment Method", key: "paymentMethod", width: 15 },
      ];

      // Format sales data for Excel
      const formattedSalesData = salesData.map(sale => ({
        orderId: sale.orderId,
        userFullName: sale.user?.fullName || "Guest", // ✅ Fixed customer name
        date: new Date(sale.timestamp).toLocaleDateString(),
        totalAmount: `₹${sale.totalAmount.toFixed(2)}`,
        paymentMethod: sale.paymentMethod,
      }));

      worksheet.addRows(formattedSalesData);

      // Grand Total Row
      worksheet.addRow([
        "Grand Total",
        "",
        "",
        `₹${salesData.reduce((sum, sale) => sum + sale.totalAmount, 0).toFixed(2)}`,
        ""
      ]);

      res.setHeader("Content-Disposition", "attachment; filename=sales_report.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error("Error generating Excel:", error);
      next(error);
    }
  }
};

module.exports = salesController;
