const Order = require('../../models/orderModel');
const Product = require('../../models/productModel');
const Category = require('../../models/categoryModel');
const Brand = require('../../models/brandModel');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const { createCanvas } = require('canvas');
const Chart = require('chart.js/auto');
const moment = require('moment');

const dashboardController={
    getdashboard:async (req,res,next) => {
        try {
            const timeFilter = req.query.timeFilter || 'monthly'; // Default to monthly
            const currentYear = new Date().getFullYear();
            
            // Get basic stats
            const totalOrders = await Order.countDocuments();
            const totalRevenue = await Order.aggregate([
              { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]);
            
            const pendingOrders = await Order.countDocuments({ orderStatus: "pending" });
            const processingOrders = await Order.countDocuments({ orderStatus: "processing" });
            const shippedOrders = await Order.countDocuments({ orderStatus: "shipped" });
            const deliveredOrders = await Order.countDocuments({ orderStatus: "delivered" });
            const cancelledOrders = await Order.countDocuments({ orderStatus: "cancelled" });
            const returnedOrders = await Order.countDocuments({ orderStatus: "returned" });
            
            // Get data for charts based on time filter
            let salesData;
            let timeLabels;
            let aggregation;
            
            if (timeFilter === 'yearly') {
              // Last 5 years data
              const years = Array.from({length: 5}, (_, i) => currentYear - i);
              aggregation = await Order.aggregate([
                {
                  $group: {
                    _id: { $year: "$timestamp" },
                    count: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" }
                  }
                },
                { $sort: { _id: 1 } }
              ]);
              
              salesData = years.map(year => {
                const found = aggregation.find(item => item._id === year);
                return found ? found.revenue : 0;
              });
              
              timeLabels = years.map(year => year.toString());
              
            } else if (timeFilter === 'monthly') {
              // Monthly data for current year
              const months = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
              ];
              
              aggregation = await Order.aggregate([
                {
                  $match: {
                    timestamp: {
                      $gte: new Date(currentYear, 0, 1),
                      $lt: new Date(currentYear + 1, 0, 1)
                    }
                  }
                },
                {
                  $group: {
                    _id: { $month: "$timestamp" },
                    count: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" }
                  }
                },
                { $sort: { _id: 1 } }
              ]);
              
              salesData = Array(12).fill(0);
              aggregation.forEach(item => {
                salesData[item._id - 1] = item.revenue;
              });
              
              timeLabels = months;
              
            } else if (timeFilter === 'weekly') {
              // Weekly data for current month
              const currentMonth = new Date().getMonth();
              const currentMonthStart = new Date(currentYear, currentMonth, 1);
              const nextMonthStart = new Date(currentYear, currentMonth + 1, 1);
              
              aggregation = await Order.aggregate([
                {
                  $match: {
                    timestamp: {
                      $gte: currentMonthStart,
                      $lt: nextMonthStart
                    }
                  }
                },
                {
                  $group: {
                    _id: { $week: "$timestamp" },
                    count: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" }
                  }
                },
                { $sort: { _id: 1 } }
              ]);
              
              // Create labels for weeks in the current month
              const weeksInMonth = [];
              let currentDate = new Date(currentMonthStart);
              let weekNum = 1;
              
              while (currentDate < nextMonthStart) {
                weeksInMonth.push(`Week ${weekNum}`);
                currentDate.setDate(currentDate.getDate() + 7);
                weekNum++;
              }
              
              timeLabels = weeksInMonth;
              salesData = Array(weeksInMonth.length).fill(0);
              
              // Map aggregation results to weeks
              aggregation.forEach((item, index) => {
                if (index < salesData.length) {
                  salesData[index] = item.revenue;
                }
              });
            } else if (timeFilter === 'daily') {
              // Daily data for current week
              const today = new Date();
              const startOfWeek = new Date(today);
              startOfWeek.setDate(today.getDate() - today.getDay());
              startOfWeek.setHours(0, 0, 0, 0);
              
              const endOfWeek = new Date(startOfWeek);
              endOfWeek.setDate(startOfWeek.getDate() + 7);
              
              aggregation = await Order.aggregate([
                {
                  $match: {
                    timestamp: {
                      $gte: startOfWeek,
                      $lt: endOfWeek
                    }
                  }
                },
                {
                  $group: {
                    _id: { $dayOfWeek: "$timestamp" },
                    count: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" }
                  }
                },
                { $sort: { _id: 1 } }
              ]);
              
              const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
              timeLabels = days;
              salesData = Array(7).fill(0);
              
              aggregation.forEach(item => {
                // MongoDB's $dayOfWeek returns 1 for Sunday, 2 for Monday, etc.
                salesData[item._id - 1] = item.revenue;
              });
            }
            
            // Get payment method distribution
            const paymentMethodStats = await Order.aggregate([
              {
                $group: {
                  _id: "$paymentMethod",
                  count: { $sum: 1 },
                  revenue: { $sum: "$totalAmount" }
                }
              }
            ]);
            
            // Get order status distribution
            const orderStatusStats = await Order.aggregate([
              {
                $group: {
                  _id: "$orderStatus",
                  count: { $sum: 1 }
                }
              }
            ]);
            
            // Get top selling products
            const topProducts = await Order.aggregate([
              { $unwind: "$items" },
              {
                $group: {
                  _id: "$items.product",
                  totalSold: { $sum: "$items.quantity" },
                  revenue: { $sum: "$items.subTotal" }
                }
              },
              { $sort: { totalSold: -1 } },
              { $limit: 5 },
              {
                $lookup: {
                  from: "products",
                  localField: "_id",
                  foreignField: "_id",
                  as: "productDetails"
                }
              },
              { $unwind: "$productDetails" },
              {
                $project: {
                  _id: 1,
                  productName: "$productDetails.productName",

                  totalSold: 1,
                  revenue: 1
                }
              }
            ]);
            
            
           // Add this to your existing getdashboard function in dashboardController.js
// Get top 10 selling products (expanded version)
const topSellingProducts = await Order.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        totalSold: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.subTotal" }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 }, // Increased to 10 products
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productDetails"
      }
    },
    { $unwind: "$productDetails" },
    {
      $project: {
        _id: 1,
        productName: "$productDetails.productName", // Updated to match your schema
        price: "$productDetails.price",
        stock: "$productDetails.stock",
        mainImage: "$productDetails.mainImage",
        category: "$productDetails.category",
        brand: "$productDetails.brands",
        totalSold: 1,
        revenue: 1
      }
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryDetails"
      }
    },
    {
      $lookup: {
        from: "brands",
        localField: "brand",
        foreignField: "_id",
        as: "brandDetails"
      }
    },
    {
      $project: {
        _id: 1,
        productName: 1,
        price: 1,
        stock: 1,
        mainImage: 1,
        totalSold: 1,
        revenue: 1,
        category: { $arrayElemAt: ["$categoryDetails.name", 0] },
        brand: { $arrayElemAt: ["$brandDetails.name", 0] }
      }
    }
  ]);



  const topSellingCategories = await Order.aggregate([
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "productDetails"
      }
    },
    { $unwind: "$productDetails" },
    {
      $lookup: {
        from: "categories",
        localField: "productDetails.category",
        foreignField: "_id",
        as: "categoryDetails"
      }
    },
    { $unwind: "$categoryDetails" },
    {
      $group: {
        _id: "$categoryDetails._id",
        categoryName: { $first: "$categoryDetails.name" },
        categoryImage: { $first: "$categoryDetails.image" },
        categoryDescription: { $first: "$categoryDetails.description" },
        categorySlug: { $first: "$categoryDetails.slug" },
        totalSold: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.subTotal" },
        productCount: { $addToSet: "$productDetails._id" }
      }
    },
    {
      $project: {
        _id: 1,
        categoryName: 1,
        categoryImage: 1,
        categoryDescription: 1,
        categorySlug: 1,
        totalSold: 1,
        revenue: 1,
        productCount: { $size: "$productCount" }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 }
  ]);


  //top selling brands

  const topSellingBrands = await Order.aggregate([
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "productDetails"
      }
    },
    { $unwind: "$productDetails" },
    {
      $lookup: {
        from: "brands",
        localField: "productDetails.brands", // Assuming "brands" is the field name in your product model
        foreignField: "_id",
        as: "brandDetails"
      }
    },
    { $unwind: "$brandDetails" },
    {
      $group: {
        _id: "$brandDetails._id",
        brandName: { $first: "$brandDetails.name" },
        brandImage: { $first: "$brandDetails.image" },
        brandDescription: { $first: "$brandDetails.description" },
        totalSold: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.subTotal" },
        productCount: { $addToSet: "$productDetails._id" }
      }
    },
    {
      $project: {
        _id: 1,
        brandName: 1,
        brandImage: 1,
        brandDescription: 1,
        totalSold: 1,
        revenue: 1,
        productCount: { $size: "$productCount" }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 }
  ]);
  
  // Make sure to add topSellingProducts to your res.render call
  return res.status(200).render('dashboard', {
    // All your existing properties...
    timeFilter,
    totalOrders,
    totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    returnedOrders,
    timeLabels: JSON.stringify(timeLabels),
    salesData: JSON.stringify(salesData),
    paymentMethodStats: JSON.stringify(paymentMethodStats),
    orderStatusStats: JSON.stringify(orderStatusStats),
    topProducts: JSON.stringify(topProducts),
    // Add this new property
    topSellingProducts: JSON.stringify(topSellingProducts),
    topSellingCategories: JSON.stringify(topSellingCategories),
    topSellingBrands: JSON.stringify(topSellingBrands)
  });
          } catch (error) {
            next(error);
          }
    },

    downloadPdf: async (req, res, next) => {
      try {
          const timeFilter = req.query.timeFilter || 'monthly';
          const currentYear = new Date().getFullYear();
          
          // Fetch the same data as in getdashboard
          // Get basic stats
          const totalOrders = await Order.countDocuments();
          const totalRevenue = await Order.aggregate([
              { $group: { _id: null, total: { $sum: "$totalAmount" } } }
          ]);
          
          const pendingOrders = await Order.countDocuments({ orderStatus: "pending" });
          const processingOrders = await Order.countDocuments({ orderStatus: "processing" });
          const shippedOrders = await Order.countDocuments({ orderStatus: "shipped" });
          const deliveredOrders = await Order.countDocuments({ orderStatus: "delivered" });
          const cancelledOrders = await Order.countDocuments({ orderStatus: "cancelled" });
          const returnedOrders = await Order.countDocuments({ orderStatus: "returned" });
          
          // Get data for charts based on time filter
          let salesData;
          let timeLabels;
          let aggregation;
          let reportTitle;
          let reportPeriod;
          
          // Set up period-specific data gathering (same logic as in getdashboard)
          if (timeFilter === 'yearly') {
              reportTitle = "Yearly Sales Report";
              reportPeriod = `Last 5 Years (${currentYear-4} - ${currentYear})`;
              // Last 5 years data
              const years = Array.from({length: 5}, (_, i) => currentYear - i);
              aggregation = await Order.aggregate([
                  {
                      $group: {
                          _id: { $year: "$timestamp" },
                          count: { $sum: 1 },
                          revenue: { $sum: "$totalAmount" }
                      }
                  },
                  { $sort: { _id: 1 } }
              ]);
              
              salesData = years.map(year => {
                  const found = aggregation.find(item => item._id === year);
                  return found ? found.revenue : 0;
              });
              
              timeLabels = years.map(year => year.toString());
              
          } else if (timeFilter === 'monthly') {
              reportTitle = "Monthly Sales Report";
              reportPeriod = `${currentYear}`;
              // Monthly data for current year
              const months = [
                  'January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'
              ];
              
              aggregation = await Order.aggregate([
                  {
                      $match: {
                          timestamp: {
                              $gte: new Date(currentYear, 0, 1),
                              $lt: new Date(currentYear + 1, 0, 1)
                          }
                      }
                  },
                  {
                      $group: {
                          _id: { $month: "$timestamp" },
                          count: { $sum: 1 },
                          revenue: { $sum: "$totalAmount" }
                      }
                  },
                  { $sort: { _id: 1 } }
              ]);
              
              salesData = Array(12).fill(0);
              aggregation.forEach(item => {
                  salesData[item._id - 1] = item.revenue;
              });
              
              timeLabels = months;
              
          } else if (timeFilter === 'weekly') {
              reportTitle = "Weekly Sales Report";
              const currentMonth = new Date().getMonth();
              reportPeriod = `${moment().format('MMMM YYYY')}`;
              
              const currentMonthStart = new Date(currentYear, currentMonth, 1);
              const nextMonthStart = new Date(currentYear, currentMonth + 1, 1);
              
              aggregation = await Order.aggregate([
                  {
                      $match: {
                          timestamp: {
                              $gte: currentMonthStart,
                              $lt: nextMonthStart
                          }
                      }
                  },
                  {
                      $group: {
                          _id: { $week: "$timestamp" },
                          count: { $sum: 1 },
                          revenue: { $sum: "$totalAmount" }
                      }
                  },
                  { $sort: { _id: 1 } }
              ]);
              
              // Create labels for weeks in the current month
              const weeksInMonth = [];
              let currentDate = new Date(currentMonthStart);
              let weekNum = 1;
              
              while (currentDate < nextMonthStart) {
                  weeksInMonth.push(`Week ${weekNum}`);
                  currentDate.setDate(currentDate.getDate() + 7);
                  weekNum++;
              }
              
              timeLabels = weeksInMonth;
              salesData = Array(weeksInMonth.length).fill(0);
              
              // Map aggregation results to weeks
              aggregation.forEach((item, index) => {
                  if (index < salesData.length) {
                      salesData[index] = item.revenue;
                  }
              });
          } else if (timeFilter === 'daily') {
              reportTitle = "Daily Sales Report";
              // Daily data for current week
              const today = new Date();
              reportPeriod = `Week of ${moment(today).startOf('week').format('MMM DD')} - ${moment(today).endOf('week').format('MMM DD, YYYY')}`;
              
              const startOfWeek = new Date(today);
              startOfWeek.setDate(today.getDate() - today.getDay());
              startOfWeek.setHours(0, 0, 0, 0);
              
              const endOfWeek = new Date(startOfWeek);
              endOfWeek.setDate(startOfWeek.getDate() + 7);
              
              aggregation = await Order.aggregate([
                  {
                      $match: {
                          timestamp: {
                              $gte: startOfWeek,
                              $lt: endOfWeek
                          }
                      }
                  },
                  {
                      $group: {
                          _id: { $dayOfWeek: "$timestamp" },
                          count: { $sum: 1 },
                          revenue: { $sum: "$totalAmount" }
                      }
                  },
                  { $sort: { _id: 1 } }
              ]);
              
              const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
              timeLabels = days;
              salesData = Array(7).fill(0);
              
              aggregation.forEach(item => {
                  // MongoDB's $dayOfWeek returns 1 for Sunday, 2 for Monday, etc.
                  salesData[item._id - 1] = item.revenue;
              });
          }
          
          // Get payment method distribution
          const paymentMethodStats = await Order.aggregate([
              {
                  $group: {
                      _id: "$paymentMethod",
                      count: { $sum: 1 },
                      revenue: { $sum: "$totalAmount" }
                  }
              }
          ]);
          
          // Get order status distribution
          const orderStatusStats = await Order.aggregate([
              {
                  $group: {
                      _id: "$orderStatus",
                      count: { $sum: 1 }
                  }
              }
          ]);
          
          // Get top selling products (top 5 for PDF)
          const topProducts = await Order.aggregate([
              { $unwind: "$items" },
              {
                  $group: {
                      _id: "$items.product",
                      totalSold: { $sum: "$items.quantity" },
                      revenue: { $sum: "$items.subTotal" }
                  }
              },
              { $sort: { totalSold: -1 } },
              { $limit: 5 },
              {
                  $lookup: {
                      from: "products",
                      localField: "_id",
                      foreignField: "_id",
                      as: "productDetails"
                  }
              },
              { $unwind: "$productDetails" },
              {
                  $project: {
                      _id: 1,
                      productName: "$productDetails.productName",
                      totalSold: 1,
                      revenue: 1
                  }
              }
          ]);
          
          // Create a new PDF document
          const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
          
          // Set response headers for PDF download
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename=sales-report-${timeFilter}-${moment().format('YYYY-MM-DD')}.pdf`);
          
          // Pipe the PDF to the response
          doc.pipe(res);
          
          // PAGE 1: Title Page and Key Statistics
          // Add header and title
          doc.fontSize(24).font('Helvetica-Bold').text('Sales Dashboard Report', { align: 'center' });
          doc.fontSize(16).font('Helvetica').text(reportTitle, { align: 'center' });
          doc.fontSize(12).text(reportPeriod, { align: 'center' });
          doc.fontSize(10).text(`Generated on: ${moment().format('MMMM DD, YYYY, h:mm A')}`, { align: 'center' });
          
          doc.moveDown(2);
          
          // Draw divider line
          doc.moveTo(50, doc.y)
             .lineTo(doc.page.width - 50, doc.y)
             .stroke();
          
          doc.moveDown();
          
          // Add Key Statistics Section
          doc.fontSize(16).font('Helvetica-Bold').text('Key Statistics', { underline: true });
          doc.moveDown();
          
          // Create a 2x3 grid for key stats
          const statData = [
              { label: "Total Orders", value: totalOrders },
              { label: "Total Revenue", value: `$${(totalRevenue.length > 0 ? totalRevenue[0].total : 0).toFixed(2)}` },
              { label: "Pending Orders", value: pendingOrders },
              { label: "Delivered Orders", value: deliveredOrders },
              { label: "Cancelled Orders", value: cancelledOrders },
              { label: "Processing Orders", value: processingOrders }
          ];
          
          // Display stats in two columns
          const statColumnWidth = (doc.page.width - 100) / 2;
          let xPos = 50;
          let yPos = doc.y;
          const initialY = yPos;
          
          statData.forEach((stat, index) => {
              if (index === 3) {
                  xPos = 50 + statColumnWidth;
                  yPos = initialY;
              }
              
              doc.font('Helvetica-Bold').fontSize(12).text(stat.label, xPos, yPos);
              doc.font('Helvetica').fontSize(14).text(stat.value, xPos, yPos + 15);
              
              if (index < 3) {
                  yPos += 40;
              } else {
                  yPos += 40;
              }
          });
          
          // PAGE 2: Revenue Overview
          doc.addPage();
          doc.fontSize(16).font('Helvetica-Bold').text('Revenue Overview', { align: 'center' });
          doc.moveDown();
          
          // Generate chart using Chart.js and canvas
          const canvas = createCanvas(500, 300);
          const ctx = canvas.getContext('2d');
          
          new Chart(ctx, {
              type: 'line',
              data: {
                  labels: timeLabels,
                  datasets: [{
                      label: 'Revenue',
                      data: salesData,
                      fill: false,
                      borderColor: 'rgb(75, 192, 192)',
                      tension: 0.1
                  }]
              },
              options: {
                  scales: {
                      y: {
                          beginAtZero: true,
                          ticks: {
                              callback: function(value) {
                                  return '$' + value;
                              }
                          }
                      }
                  },
                  plugins: {
                      legend: {
                          position: 'top'
                      }
                  }
              }
          });
          
          // Add chart to PDF
          doc.image(canvas.toBuffer(), {
              fit: [500, 300],
              align: 'center',
              valign: 'center'
          });
          
          // PAGE 3: Top Products and Order Status
          doc.addPage();
          doc.fontSize(16).font('Helvetica-Bold').text('Top Selling Products', { align: 'left' });
          doc.moveDown();
          
          // Draw table header
          const tableTop = doc.y;
          const tableHeaders = ['Product Name', 'Units Sold', 'Revenue'];
          const columnWidth = (doc.page.width - 100) / 3;
          
          // Draw header
          doc.font('Helvetica-Bold').fontSize(12);
          tableHeaders.forEach((header, i) => {
              doc.text(header, 50 + (i * columnWidth), tableTop, { width: columnWidth, align: 'left' });
          });
          
          // Draw header line
          doc.moveTo(50, tableTop + 20)
             .lineTo(doc.page.width - 50, tableTop + 20)
             .stroke();
          
          // Draw rows
          let rowTop = tableTop + 30;
          doc.font('Helvetica').fontSize(12);
          
          topProducts.forEach((product, i) => {
              doc.text(product.productName || 'Unknown', 50, rowTop, { width: columnWidth, align: 'left' });
              doc.text(product.totalSold.toString(), 50 + columnWidth, rowTop, { width: columnWidth, align: 'left' });
              doc.text(`$${product.revenue.toFixed(2)}`, 50 + (columnWidth * 2), rowTop, { width: columnWidth, align: 'left' });
              
              rowTop += 20;
          });
          
          // Draw table border
          doc.rect(50, tableTop, doc.page.width - 100, rowTop - tableTop).stroke();
          
          // Add order status distribution chart
          doc.moveDown(3);
          doc.fontSize(16).font('Helvetica-Bold').text('Order Status Distribution', { align: 'left' });
          doc.moveDown();
          
          const statusCanvas = createCanvas(400, 300);
          const statusCtx = statusCanvas.getContext('2d');
          
          new Chart(statusCtx, {
              type: 'pie',
              data: {
                  labels: orderStatusStats.map(item => item._id),
                  datasets: [{
                      data: orderStatusStats.map(item => item.count),
                      backgroundColor: [
                          '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796'
                      ]
                  }]
              },
              options: {
                  plugins: {
                      legend: {
                          position: 'right'
                      }
                  }
              }
          });
          
          // Add status chart to PDF
          doc.image(statusCanvas.toBuffer(), {
              fit: [400, 300],
              align: 'center',
              valign: 'center'
          });
          
          // Add PDF footer with page numbers
          const pageCount = doc.bufferedPageRange().count;
          for (let i = 0; i < pageCount; i++) {
              doc.switchToPage(i);
              doc.fontSize(8).text(
                  `Page ${i + 1} of ${pageCount}`,
                  50,
                  doc.page.height - 50,
                  { align: 'center' }
              );
          }
          
          // Finalize PDF
          doc.end();
          
      } catch (error) {
          console.error('PDF Generation Error:', error);
          // Don't try to send headers if they've already been sent
          if (!res.headersSent) {
              res.status(500).send('Error generating PDF report');
          }
          next(error);
      }
  }





}

module.exports=dashboardController