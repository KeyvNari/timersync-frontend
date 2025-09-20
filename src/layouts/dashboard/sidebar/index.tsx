import { NavLink as RouterLink, useLocation } from 'react-router-dom';
import { NavLink, Title, Tooltip, ActionIcon, Box, ScrollArea } from '@mantine/core';
import { PiCaretLeftBold, PiCaretRightBold } from 'react-icons/pi';
import { menu } from './menu-sections';
import classes from './sidebar.module.css';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const { pathname } = useLocation();

  // Calculate available height for sections (subtract toggle button height)
  const sectionHeight = `calc((100vh - 140px) / ${menu.length})`;

  return (
    <div className={`${classes.sidebarContainer} ${collapsed ? classes.collapsed : ''}`}>
      {/* Toggle Button */}
      <Box className={classes.toggleContainer}>
        <ActionIcon
          variant="subtle"
          size="sm"
          onClick={onToggle}
          className={classes.toggleButton}
        >
          {collapsed ? <PiCaretRightBold size="1rem" /> : <PiCaretLeftBold size="1rem" />}
        </ActionIcon>
      </Box>

      {/* Sidebar Sections with Fixed Heights */}
      <div className={classes.sectionsContainer}>
        {menu.map((item, index) => (
          <div 
            key={item.header} 
            className={classes.section}
            style={{ height: sectionHeight }}
          >
            {!collapsed && (
              <Title order={6} className={classes.sectionTitle}>
                {item.header}
              </Title>
            )}

            <ScrollArea 
              className={classes.sectionScrollArea}
              scrollbarSize={6}
              scrollHideDelay={800}
              styles={{
                scrollbar: {
                  '&[data-orientation="vertical"]': {
                    width: '6px',
                  },
                  '&[data-orientation="vertical"] .mantine-ScrollArea-thumb': {
                    backgroundColor: 'var(--mantine-color-gray-4)',
                  },
                },
              }}
            >
              <div className={classes.sectionContent}>
                {item.section.map((subItem) =>
                  subItem.dropdownItems ? (
                    collapsed ? (
                      // Collapsed mode: Show tooltip for dropdown items
                      <Tooltip
                        key={subItem.name}
                        label={subItem.name}
                        position="right"
                        withArrow
                        offset={10}
                      >
                        <NavLink
                          variant="subtle"
                          label=""
                          childrenOffset={0}
                          className={classes.sectionLink}
                          active={pathname.includes(subItem.href)}
                          leftSection={subItem.icon && <subItem.icon />}
                          data-collapsed="true"
                        />
                      </Tooltip>
                    ) : (
                      // Expanded mode: Show full dropdown
                      <NavLink
                        variant="subtle"
                        key={subItem.name}
                        label={subItem.name}
                        childrenOffset={0}
                        className={classes.sectionLink}
                        active={pathname.includes(subItem.href)}
                        leftSection={subItem.icon && <subItem.icon />}
                      >
                        {subItem.dropdownItems?.map((dropdownItem) => (
                          <NavLink
                            variant="subtle"
                            component={RouterLink}
                            to={dropdownItem.href}
                            key={dropdownItem.name}
                            label={dropdownItem.name}
                            active={pathname.includes(dropdownItem.href)}
                            className={classes.sectionDropdownItemLink}
                            leftSection={<span className="dot" />}
                          />
                        ))}
                      </NavLink>
                    )
                  ) : collapsed ? (
                    // Collapsed mode: Show tooltip for regular items
                    <Tooltip
                      key={subItem.name}
                      label={subItem.name}
                      position="right"
                      withArrow
                      offset={10}
                    >
                      <NavLink
                        variant="subtle"
                        component={RouterLink}
                        to={subItem.href}
                        label=""
                        className={classes.sectionLink}
                        leftSection={subItem.icon && <subItem.icon />}
                        data-collapsed="true"
                      />
                    </Tooltip>
                  ) : (
                    // Expanded mode: Show full item
                    <NavLink
                      variant="subtle"
                      component={RouterLink}
                      to={subItem.href}
                      key={subItem.name}
                      label={subItem.name}
                      className={classes.sectionLink}
                      leftSection={subItem.icon && <subItem.icon />}
                    />
                  )
                )}
              </div>
            </ScrollArea>
          </div>
        ))}
      </div>
    </div>
  );
}