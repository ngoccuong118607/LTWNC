const express = require('express');
const Project = require('../models/Project');
const router = express.Router();
// Thêm dự án mới
router.post('/projects', async (req, res) => {
 const project = new Project(req.body);
 await project.save();
 res.send(project);
});
// Lấy danh sách tất cả dự án
router.get('/projects', async (req, res) => {
 const projects = await Project.find();
 res.send(projects);
});
// Sửa dự án
router.put('/projects/:id', async (req, res) => {
 const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new:
true });
 res.send(project);
});
// Xóa dự án
router.delete('/projects/:id', async (req, res) => {
 await Project.findByIdAndDelete(req.params.id);
 res.send({ message: 'Project deleted' });
});
// Tìm kiếm dự án theo trạng thái
router.get('/projects/search/:status', async (req, res) => {
 const projects = await Project.find({ status: req.params.status });
 res.send(projects);
});
// Báo cáo số lượng thành viên tham gia theo trạng thái
router.get('/projects/report', async (req, res) => {
 const report = await Project.aggregate([
 { $group: { _id: '$status', totalMembers: { $sum: { $size: '$teamMembers' } } } },
 ]);
 res.send(report);
});
module.exports = router;