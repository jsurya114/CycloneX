const Order = require('../../models/orderModel');

const PDFDocument = require("pdfkit"); // For PDF generation
const ExcelJS = require("exceljs");
const { timeStamp } = require('console');

const salesController = {
  getSaleReport: async (req, res, next) => {
    try {
      let { startDate, endDate,  timeFilters, page = 1, limit = 10 } = req.query;

      // Base date setup
      let today = new Date();

      //resets the current date to midnight (00:00:00),
      today.setHours(0, 0, 0, 0);
      let startDateTime = new Date(today);
      let endDateTime = new Date();
      endDateTime.setHours(23, 59, 59, 999);

      // Time filter logic
      if (timeFilters) {
        switch (timeFilters) {
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
        timeFilters = 'custom';
      } else {
        startDateTime.setDate(startDateTime.getDate() - 30);
        timeFilters = 'last30days';
      }

      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid date format." });
      }

      const query = { timestamp: { $gte: startDateTime, $lte: endDateTime } };

      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10
      
      // Fetch orders
      const allOrders = await Order.find(query)
      .sort({timestamp:-1})
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
      
        .populate('user', 'fullName email')
        .populate({
          path: 'items.product',
          select: 'productName'
        });
     
      const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const totalCouponPrice = allOrders.reduce((sum, order) => sum + (order.couponDiscount || 0), 0);
      const recentOrders = allOrders.slice(0, 10).map(order => ({
        orderid: order._id,
        orderId: order.orderId,
        user: order.user,
        email: order.user?.email || "N/A",
        timestamp: order.timestamp,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentMethod === 'Razorpay' ? 'Paid' : 
        order.orderStatus === 'cancelled' || order.orderStatus === 'refunded' ? 'Refunded' :
        order.orderStatus === 'delivered' ? 'Paid' : 'Pending',
        paymentMethod: order.paymentMethod
      }));
    
      const totalOrders = await Order.countDocuments(query)
      res.status(200).render("salesreport", {
        success: true,
        totalRevenue,
        totalCouponPrice,
        totalOrders,
        orders: recentOrders,
        currentPage: pageNum,
        totalPages: Math.ceil(totalOrders / limitNum),
        timeFilters,
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
  
      // Fetch product details for all orders
      const orderIds = salesData.map(sale => sale.orderid);
      const ordersWithProducts = await Order.find({ _id: { $in: orderIds } })
        .populate('user', 'fullName email')
        .populate({
          path: 'items.product',
          select: 'productName'
        });
  
      // Create a mapping of order ID to products
      const orderProductMap = {};
      ordersWithProducts.forEach(order => {
        if (order._id) {
          orderProductMap[order._id.toString()] = order.items || [];
        }
      });
  
      // Prepare data for PDF with product information - LIMIT TO TOP 6 ITEMS
      let pdfData = [];
      salesData.forEach(sale => {
        const orderItems = orderProductMap[sale.orderid?.toString()] || [];
        
        if (orderItems.length > 0) {
          // Create one row per product
          orderItems.forEach(item => {
            pdfData.push({
              ...sale,
              productName: item.product?.productName || "Unknown Product"
            });
          });
        } else {
          // If no products found, include order with N/A product
          pdfData.push({
            ...sale,
            productName: "N/A"
          });
        }
      });
  
      // Limit to maximum 6 items to ensure single page
      const displayData = pdfData.slice(0, 6);
      const hiddenItems = pdfData.length - displayData.length;
  
      const doc = new PDFDocument({ margin: 30, size: 'A4' }); // Reduced margins
      res.setHeader("Content-Disposition", "attachment; filename=sales_report.pdf");
      res.setHeader("Content-Type", "application/pdf");
  
      doc.pipe(res);
      
      // Add title and date with smaller spacing
      doc.fontSize(18).font('Helvetica-Bold').text("Sales Report", { align: "center" });
      doc.fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "center" });
      doc.moveDown(1); // Reduced spacing
  
      // Define table layout with more compact widths
      const headers = ["Order ID", "Customer", "Product", "Date", "Amount", "Payment"];
      const columnWidths = [70, 85, 95, 65, 65, 65]; // More compact widths
      const tableWidth = columnWidths.reduce((sum, width) => sum + width, 0);
      const startX = (doc.page.width - tableWidth) / 2;
      const rowHeight = 25; // Reduced row height for better spacing
      let y = doc.y;
  
      // Add table header
      doc.fillColor("#4472C4").rect(startX, y, tableWidth, rowHeight).fill();
      doc.fillColor("white").font("Helvetica-Bold").fontSize(9); // Smaller font
      
      let x = startX;
      headers.forEach((header, i) => {
        doc.text(
          header, 
          x + 3, 
          y + (rowHeight/2) - 4, 
          { 
            width: columnWidths[i] - 6, 
            align: i === 0 ? "left" : i === 4 ? "right" : "center",
            lineBreak: false
          }
        );
        x += columnWidths[i];
      });
      
      y += rowHeight;
  
      // Draw table rows with more compact styling
      doc.font("Helvetica").fontSize(8); // Smaller font for data
      
      displayData.forEach((sale, rowIndex) => {
        // Alternate row background
        if (rowIndex % 2 === 0) {
          doc.fillColor("#E9EDF8").rect(startX, y, tableWidth, rowHeight).fill();
        }
        doc.fillColor("black"); // Reset fill color
        
        // Draw row data
        let x = startX;
        
        // Format data with shorter truncation
        const orderId = sale.orderId;
        let displayOrderId = orderId;
        
        if (orderId && orderId.length > 10) {
          displayOrderId = orderId.substring(0, 8) + "...";
        }
        
        const customerName = sale.user?.fullName || "Guest";
        const truncatedName = customerName.length > 14 ? 
          customerName.substring(0, 12) + "..." : 
          customerName;
            
        const productName = sale.productName || "N/A";
        const truncatedProduct = productName.length > 16 ?
          productName.substring(0, 14) + "..." :
          productName;
            
        const formattedDate = new Date(sale.timestamp).toLocaleDateString();
        const formattedAmount = `₹${sale.totalAmount.toFixed(2)}`;
        
        const rowData = [
          displayOrderId,
          truncatedName,
          truncatedProduct,
          formattedDate,
          formattedAmount,
          sale.paymentMethod
        ];
        
        rowData.forEach((text, i) => {
          const textOptions = { 
            width: columnWidths[i] - 6,
            align: i === 0 ? "left" : i === 4 ? "right" : "center",
            lineBreak: false
          };
          
          doc.text(text, x + 3, y + (rowHeight/2) - 4, textOptions);
          x += columnWidths[i];
        });
        
        // Draw cell borders
        doc.strokeColor("#CCCCCC");
        
        // Horizontal line at bottom of row
        doc.moveTo(startX, y + rowHeight)
           .lineTo(startX + tableWidth, y + rowHeight)
           .stroke();
        
        // Vertical lines
        x = startX;
        for (let i = 0; i <= columnWidths.length; i++) {
          doc.moveTo(x, y)
             .lineTo(x, y + rowHeight)
             .stroke();
          
          if (i < columnWidths.length) {
            x += columnWidths[i];
          }
        }
        
        y += rowHeight;
      });
  
      // Add note about hidden items if any
      if (hiddenItems > 0) {
        doc.font("Helvetica-Italic").fontSize(8).fillColor("#666666");
        doc.text(`Note: ${hiddenItems} more items not shown to fit report on single page.`, startX, y + 5);
        y += 20;
      } else {
        y += 10;
      }
  
      // Add Grand Total with compact styling
      doc.strokeColor("#000000");
      doc.lineWidth(1);
      doc.rect(startX, y, tableWidth, rowHeight).stroke();
      
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#4472C4");
      doc.text(
        "Grand Total:",
        startX + 5, 
        y + (rowHeight/2) - 5,
        { width: tableWidth - 105, align: "right" }
      );
      
      doc.text(
        `₹${salesData.reduce((sum, sale) => sum + sale.totalAmount, 0).toFixed(2)}`,
        startX + tableWidth - 100,
        y + (rowHeight/2) - 5,
        { width: 95, align: "right" }
      );
  
      // Add Summary Section with compact styling
      y += rowHeight + 15;
      
      // Calculate summary statistics
      const uniqueOrders = new Set(salesData.map(sale => sale.orderId)).size;
      const totalProducts = pdfData.length;
      const totalRevenue = salesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
      const avgOrderValue = uniqueOrders > 0 ? totalRevenue / uniqueOrders : 0;
      
      // Create compact summary layout (2x2 grid instead of vertical)
      doc.font("Helvetica-Bold").fontSize(12).fillColor("#000000");
      doc.text("SUMMARY", startX, y);
      y += 15;
      
      const summaryRowHeight = 20;
      const summaryWidth = tableWidth / 2;
      
      // First row of summary (2 columns)
      doc.fillColor("#F5F5F5").rect(startX, y, tableWidth, summaryRowHeight).fill();
      doc.fillColor("#000000");
      
      // Column 1
      doc.font("Helvetica-Bold").fontSize(9);
      doc.text("Total Orders:", startX + 5, y + 6);
      doc.font("Helvetica").fontSize(9);
      doc.text(uniqueOrders.toString(), startX + 80, y + 6);
      
      // Column 2
      doc.font("Helvetica-Bold").fontSize(9);
      doc.text("Total Products:", startX + summaryWidth + 5, y + 6);
      doc.font("Helvetica").fontSize(9);
      doc.text(totalProducts.toString(), startX + summaryWidth + 85, y + 6);
      
      y += summaryRowHeight;
      
      // Second row of summary (2 columns)
      doc.fillColor("#FFFFFF").rect(startX, y, tableWidth, summaryRowHeight).fill();
      doc.fillColor("#000000");
      
      // Column 1
      doc.font("Helvetica-Bold").fontSize(9);
      doc.text("Total Revenue:", startX + 5, y + 6);
      doc.font("Helvetica").fontSize(9);
      doc.text(`₹${totalRevenue.toFixed(2)}`, startX + 80, y + 6);
      
      // Column 2
      doc.font("Helvetica-Bold").fontSize(9);
      doc.text("Avg Order Value:", startX + summaryWidth + 5, y + 6);
      doc.font("Helvetica").fontSize(9);
      doc.text(`₹${avgOrderValue.toFixed(2)}`, startX + summaryWidth + 85, y + 6);
  
      // Add footer at bottom of page
      doc.fontSize(8).fillColor("#666666")
        .text(
          "COMPANY NAME | CONFIDENTIAL",
          50,
          doc.page.height - 30,
          { align: "left" }
        );
            
      // Add timestamp on right
      doc.text(
        `Generated: ${new Date().toLocaleString()}`,
        doc.page.width - 150,
        doc.page.height - 30,
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

      // Fetch product details for all orders
      const orderIds = salesData.map(sale => sale.orderid);
      const ordersWithProducts = await Order.find({ _id: { $in: orderIds } })
        .populate('user', 'fullName email')
        .populate({
          path: 'items.product',
          select: 'productName'
        });

      // Create a mapping of order ID to products
      const orderProductMap = {};
      ordersWithProducts.forEach(order => {
        if (order._id) {
          orderProductMap[order._id.toString()] = order.items || [];
        }
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sales Report");

      // Define columns including product
      worksheet.columns = [
        { header: "Order ID", key: "orderId", width: 20 },
        { header: "Customer", key: "userFullName", width: 20 },
        { header: "Product", key: "productName", width: 25 }, // New column
        { header: "Date", key: "date", width: 15 },
        { header: "Total Amount (₹)", key: "totalAmount", width: 15 },
        { header: "Payment Method", key: "paymentMethod", width: 15 },
      ];

      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' }
      };
      worksheet.getRow(1).font = { color: { argb: 'FFFFFF' }, bold: true };

      // Format sales data for Excel - now including product info
      const formattedSalesData = [];
      salesData.forEach(sale => {
        const orderItems = orderProductMap[sale.orderid?.toString()] || [];
        
        if (orderItems.length > 0) {
          // Create one row per product
          orderItems.forEach(item => {
            formattedSalesData.push({
              orderId: sale.orderId,
              userFullName: sale.user?.fullName || "Guest",
              productName: item.product?.productName || "Unknown Product",
              date: new Date(sale.timestamp).toLocaleDateString(),
              totalAmount: sale.totalAmount,
              paymentMethod: sale.paymentMethod,
            });
          });
        } else {
          // If no products found, include order with N/A product
          formattedSalesData.push({
            orderId: sale.orderId,
            userFullName: sale.user?.fullName || "Guest",
            productName: "N/A",
            date: new Date(sale.timestamp).toLocaleDateString(),
            totalAmount: sale.totalAmount,
            paymentMethod: sale.paymentMethod,
          });
        }
      });

      // Add data to worksheet
      worksheet.addRows(formattedSalesData);

      // Format the currency column
      worksheet.getColumn('totalAmount').numFmt = '"₹"#,##0.00';

      // Style alternating rows
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
          if (rowNumber % 2 === 0) {
            row.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'E9EDF8' }
            };
          }
        }
      });

      // Grand Total Row
      const totalRow = worksheet.addRow({
        orderId: "Grand Total",
        userFullName: "",
        productName: "",
        date: "",
        totalAmount: salesData.reduce((sum, sale) => sum + sale.totalAmount, 0),
        paymentMethod: ""
      });
      
      // Style the grand total row
      totalRow.font = { bold: true };
      totalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'D9D9D9' }
      };

      // Add a few empty rows after the grand total
      worksheet.addRow([]);
      worksheet.addRow([]);

      // Add Summary Section header
      const summaryHeaderRow = worksheet.addRow(["SUMMARY"]);
      summaryHeaderRow.font = { bold: true, size: 14 };
      worksheet.addRow([]);

      // Calculate summary metrics
      const uniqueOrders = new Set(salesData.map(sale => sale.orderId)).size;
      const totalProducts = formattedSalesData.length;
      const totalRevenue = salesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
      const avgOrderValue = uniqueOrders > 0 ? totalRevenue / uniqueOrders : 0;

      // Add summary data
      const summaryData = [
        ["Total Orders", uniqueOrders],
        ["Total Products Sold", totalProducts],
        ["Total Revenue", totalRevenue],
        ["Average Order Value", avgOrderValue]
      ];

      summaryData.forEach((data, index) => {
        const row = worksheet.addRow(data);
        row.getCell(1).font = { bold: true };
        
        if (index === 2 || index === 3) { // Format currency cells
          row.getCell(2).numFmt = '"₹"#,##0.00';
        }
        
        // Add alternating background colors
        if (index % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F5F5F5' }
          };
        }
      });

      res.setHeader("Content-Disposition", "attachment; filename=sales_report.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error("Error generating Excel:", error);
      next(error);
    }
  },
};

module.exports = salesController;