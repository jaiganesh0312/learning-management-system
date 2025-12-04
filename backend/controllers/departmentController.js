const { Department, User, LearningPath } = require('../models');
const { Op } = require('sequelize');
const { createAuditLog } = require('../utils/auditLogger');

/**
 * Create a new department
 */
const createDepartment = async (req, res) => {
  try {
    const { name, description, parentDepartmentId, managerId } = req.body;
    console.log(req.body);

    // Validate manager if provided
    if (managerId) {
      const manager = await User.findByPk(managerId);
      if (!manager) {
        return res.status(404).json({ success: false, message: 'Manager not found' });
      }
    }

    const department = await Department.create({
      name,
      description,
      parentDepartmentId,
      managerId,
    });

    await createAuditLog({
      action: 'CREATE_DEPARTMENT',
      resource: 'Department',
      resourceId: department.id,
      details: { name, description, parentDepartmentId, managerId }
    }, req);

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department,
    });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating department',
      error: error.message,
    });
  }
};

/**
 * Get all departments (hierarchical or flat)
 */
const getAllDepartments = async (req, res) => {
  try {
    const { flat } = req.query;

    if (flat === 'true') {
      const departments = await Department.findAll({
        include: [
          { model: User, as: 'manager', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: Department, as: 'parentDepartment', attributes: ['id', 'name'] }
        ],
        order: [['name', 'ASC']],
      });
      return res.status(200).json({ success: true, data: departments });
    }

    // Get hierarchical structure (root departments)
    const departments = await Department.findAll({
      where: { parentDepartmentId: null },
      include: [
        { model: User, as: 'manager', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { 
          model: Department, 
          as: 'subDepartments',
          include: [{ model: User, as: 'manager', attributes: ['id', 'firstName', 'lastName', 'email'] }] 
        }
      ],
      order: [['name', 'ASC']],
    });

    res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching departments',
      error: error.message,
    });
  }
};

/**
 * Get single department details
 */
const getDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id, {
      include: [
        { model: User, as: 'manager', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Department, as: 'parentDepartment', attributes: ['id', 'name'] },
        { model: Department, as: 'subDepartments' },
        { model: LearningPath, as: 'learningPaths' },
        { model: User, as: 'members', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
    });

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching department',
      error: error.message,
    });
  }
};

/**
 * Update department
 */
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    await department.update(updateData);

    await createAuditLog({
      action: 'UPDATE_DEPARTMENT',
      resource: 'Department',
      resourceId: department.id,
      details: { updateData }
    }, req);

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department,
    });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating department',
      error: error.message,
    });
  }
};

/**
 * Delete department
 */
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Check for sub-departments
    const subDepts = await Department.count({ where: { parentDepartmentId: id } });
    if (subDepts > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete department with sub-departments. Move or delete them first.' 
      });
    }

    await department.destroy();

    await createAuditLog({
      action: 'DELETE_DEPARTMENT',
      resource: 'Department',
      resourceId: id,
      details: { departmentName: department.name }
    }, req);

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting department',
      error: error.message,
    });
  }
};

/**
 * Assign user to department
 */
const assignUserToDepartment = async (req, res) => {
  try {
    const { id } = req.params; // Department ID
    const { userId } = req.body;

    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.update({ departmentId: id });

    await createAuditLog({
      action: 'ASSIGN_USER_TO_DEPARTMENT',
      resource: 'User',
      resourceId: userId,
      details: { departmentId: id }
    }, req);

    res.status(200).json({
      success: true,
      message: 'User assigned to department successfully',
    });
  } catch (error) {
    console.error('Error assigning user to department:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning user to department',
      error: error.message,
    });
  }
};

/**
 * Remove user from department
 */
const removeUserFromDepartment = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const user = await User.findOne({ where: { id: userId, departmentId: id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found in this department' });
    }

    await user.update({ departmentId: null });

    await createAuditLog({
      action: 'REMOVE_USER_FROM_DEPARTMENT',
      resource: 'User',
      resourceId: userId,
      details: { departmentId: id }
    }, req);

    res.status(200).json({
      success: true,
      message: 'User removed from department successfully',
    });
  } catch (error) {
    console.error('Error removing user from department:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing user from department',
      error: error.message,
    });
  }
};

module.exports = {
  createDepartment,
  getAllDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
  assignUserToDepartment,
  removeUserFromDepartment,
};
