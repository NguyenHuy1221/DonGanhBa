const express = require('express');
const router = express.Router();
const Report = require('./models/Report'); // Đảm bảo đúng đường dẫn đến model

// Gửi báo cáo
router.post('/report', async (req, res) => {
    const { reporterId, targetId, targetType, reason, details } = req.body;

    try {
        const newReport = new Report({ reporterId, targetId, targetType, reason, details });
        await newReport.save();
        res.status(201).json(newReport);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi gửi báo cáo' });
    }
});

// Lấy danh sách báo cáo
router.get('/reports', async (req, res) => {
    try {
        const reports = await Report.find().populate('reporterId');
        res.status(200).json(reports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách báo cáo' });
    }
});

// Cập nhật trạng thái báo cáo
router.put('/report/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const report = await Report.findById(id);
        if (!report) {
            return res.status(404).json({ message: 'Không tìm thấy báo cáo' });
        }

        report.status = status;
        await report.save();
        res.status(200).json(report);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái báo cáo' });
    }
});

module.exports = router;
