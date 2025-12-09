import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Select, SelectItem } from "@heroui/react";
import { roleService } from '@/services';

export default function UserRoleModal({ isOpen, onClose, user, roles, onUpdate }) {
    const [selectedRoleToAdd, setSelectedRoleToAdd] = useState("");
    const [selectedRoleToRevoke, setSelectedRoleToRevoke] = useState("");

    // Reset selections when modal opens or user changes
    useEffect(() => {
        if (isOpen) {
            setSelectedRoleToAdd("");
            setSelectedRoleToRevoke("");
        }
    }, [isOpen, user]);

    const handleAddRole = async () => {
        if (!user || !selectedRoleToAdd) return;
        try {
            const response = await roleService.assignRole({
                userId: user.id,
                roleId: selectedRoleToAdd
            });
            if (response?.data?.success) {
                onUpdate();
                // Don't close modal, allow multiple role changes potentially? 
                // Previous logic closed it. Let's stick to previous logic or better UX?
                // The prompt asked to "pass the user as prop", implying separation.
                // The previous logic for handleAddRole was: fetchData(), clear selection, close modal (commented "For simplicity").
                // Let's close it for now to match behavior.
                onClose();
            }
        } catch (error) {
            console.error('Error assigning role:', error);
        }
    };

    const handleRevokeRole = async () => {
        if (!user || !selectedRoleToRevoke) return;
        try {
            const response = await roleService.revokeRole({
                userId: user.id,
                roleId: selectedRoleToRevoke
            });
            if (response?.data?.success) {
                onUpdate();
                onClose();
            }
        } catch (error) {
            console.error('Error revoking role:', error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <ModalHeader>Manage Roles - {user?.firstName} {user?.lastName}</ModalHeader>
                <ModalBody>
                    <div className="space-y-6">
                        {/* Assign Role Section */}
                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <p className="text-sm font-medium mb-3 text-primary">Assign New Role</p>
                            {roles.filter(role => !user?.userRoles?.some(ur => ur.roleId === role.id)).length > 0 ? (
                                <div className="flex gap-2">
                                    <Select
                                        placeholder="Select role to assign"
                                        selectedKeys={selectedRoleToAdd ? [selectedRoleToAdd] : []}
                                        onChange={(e) => setSelectedRoleToAdd(e.target.value)}
                                        className="flex-1"
                                    >
                                        {roles
                                            .filter(role => !user?.userRoles?.some(ur => ur.roleId === role.id))
                                            .map((role) => (
                                                <SelectItem key={role.id} value={role.id}>
                                                    {role.name}
                                                </SelectItem>
                                            ))
                                        }
                                    </Select>
                                    <Button
                                        color="primary"
                                        onPress={handleAddRole}
                                        isDisabled={!selectedRoleToAdd}
                                    >
                                        Assign
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">All available roles are already assigned to this user.</p>
                            )}
                        </div>

                        {/* Revoke Role Section */}
                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <p className="text-sm font-medium mb-3 text-danger">Revoke Role</p>
                            {user?.userRoles?.length > 0 ? (
                                <div className="flex gap-2">
                                    <Select
                                        placeholder="Select role to revoke"
                                        selectedKeys={selectedRoleToRevoke ? [selectedRoleToRevoke] : []}
                                        onChange={(e) => setSelectedRoleToRevoke(e.target.value)}
                                        className="flex-1"
                                    >
                                        {user.userRoles.map((ur) => (
                                            <SelectItem key={ur.roleId} value={ur.roleId}>
                                                {ur.role?.name}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <Button
                                        color="danger"
                                        variant="flat"
                                        onPress={handleRevokeRole}
                                        isDisabled={!selectedRoleToRevoke}
                                    >
                                        Revoke
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No roles assigned to revoke.</p>
                            )}
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
