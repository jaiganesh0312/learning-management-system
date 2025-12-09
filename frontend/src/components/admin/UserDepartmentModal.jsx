import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Select, SelectItem } from "@heroui/react";
import { departmentService } from '@/services';

export default function UserDepartmentModal({ isOpen, onClose, user, departments, onUpdate }) {
    const [selectedDepartmentId, setSelectedDepartmentId] = useState("");

    // Reset selection when user or isOpen changes
    useEffect(() => {
        if (isOpen) {
            setSelectedDepartmentId("");
        }
    }, [isOpen, user]);

    const handleAssignDepartment = async () => {
        if (!selectedDepartmentId || !user) return;
        try {
            const response = await departmentService.assignUserToDepartment(selectedDepartmentId, { userId: user.id });
            if (response?.data?.success) {
                onUpdate();
                onClose();
            }
        } catch (error) {
            console.error('Error assigning department:', error);
        }
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <ModalHeader>
                    {user?.departmentId ? 'Change Department' : 'Add to Department'}
                </ModalHeader>
                <ModalBody>
                    <div className="grid gap-2">
                        <p>
                            {user?.department
                                ? `Change department for `
                                : `Assign `}
                            <strong>{user?.firstName} {user?.lastName}</strong>
                            {user?.department ? ' from ' : ' to a department.'}
                            {user?.department && <strong>{user.department.name}</strong>}
                        </p>
                        <Select
                            label="Department"
                            placeholder="Select a department"
                            selectedKeys={selectedDepartmentId ? [selectedDepartmentId] : []}
                            onChange={(e) => setSelectedDepartmentId(e.target.value)}
                        >
                            {departments
                                .filter(dept => !user?.departmentId || dept.id !== user.departmentId)
                                .map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                        </Select>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        onPress={handleAssignDepartment}
                        isDisabled={!selectedDepartmentId}
                    >
                        {user?.department ? 'Change Department' : 'Add to Department'}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
