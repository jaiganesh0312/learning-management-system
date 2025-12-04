import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Navbar as NextUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
} from "@heroui/react";
import { useState } from 'react';
import { Icon } from "@iconify/react";
import NavigationDrawer from '@/components/NavigationDrawer';

export default function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user, activeRole, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <NextUINavbar
        maxWidth="full"
        className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
        height="72px"
      >
        <NavbarContent>
          {/* Drawer Toggle Button - Only show when authenticated */}
          {isAuthenticated && (
            <NavbarItem>
              <Button
                isIconOnly
                variant="light"
                onPress={() => setIsDrawerOpen(true)}
                aria-label="Toggle navigation"
              >
                <Icon icon="mdi:menu" className="text-2xl" />
              </Button>
            </NavbarItem>
          )}

          {/* Logo */}
          <NavbarBrand>
            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:school" className="text-2xl text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 dark:text-white">LMS</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">
                  Learning Management System
                </span>
              </div>
            </Link>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent justify="end" className="gap-4">
          {isAuthenticated ? (
            <>
              {/* User Profile Dropdown */}
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="hidden sm:block text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {activeRole?.displayName || 'User'}
                      </p>
                    </div>
                    <Avatar
                      as="button"
                      className="transition-transform"
                      color="primary"
                      name={`${user?.firstName} ${user?.lastName}`}
                      size="sm"
                      src={user?.avatarUrl}
                      isBordered
                    />
                  </div>
                </DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions" variant="flat">
                  <DropdownItem key="profile" className="h-14 gap-2" textValue="profile">
                    <p className="font-semibold text-gray-600 dark:text-gray-400">Signed in as</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{user?.email}</p>
                  </DropdownItem>
                  <DropdownItem
                    key="my_profile"
                    onClick={() => navigate('/profile')}
                    startContent={<Icon icon="mdi:account" className="text-lg" />}
                  >
                    My Profile
                  </DropdownItem>
                  <DropdownItem
                    key="settings"
                    onClick={() => navigate('/settings')}
                    startContent={<Icon icon="mdi:cog" className="text-lg" />}
                  >
                    Settings
                  </DropdownItem>
                  <DropdownItem
                    key="roles"
                    onClick={() => navigate('/roles')}
                    startContent={<Icon icon="mdi:shield-account" className="text-lg" />}
                  >
                    Manage Roles
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    color="danger"
                    onClick={handleLogout}
                    startContent={<Icon icon="mdi:logout" className="text-lg" />}
                  >
                    Log Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </>
          ) : (
            <>
              <Link to="/enquiry">
                <Button
                  color="default"
                  variant="light"
                  size="md"
                  startContent={<Icon icon="mdi:email" />}
                >
                  Contact
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  color="primary"
                  variant="solid"
                  size="md"
                  startContent={<Icon icon="mdi:login" />}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Login
                </Button>
              </Link>
            </>
          )}
        </NavbarContent>
      </NextUINavbar>

      {/* Navigation Drawer */}
      {isAuthenticated && (
        <NavigationDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}
    </>
  );
}
