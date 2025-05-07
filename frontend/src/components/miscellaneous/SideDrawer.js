import React, { useState } from "react";
import {
  Box,
  Button,
  Tooltip,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  Badge,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Input,
  useDisclosure,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { useHistory } from "react-router-dom";
import axios from "axios";

import { ChatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModal";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";
import { getSender } from "../../config/ChatLogics";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();

  const {
    user,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();
  const history = useHistory();
  // useDisclosure hook provides state and handlers for Drawer, Modal, etc.
  const { isOpen, onOpen, onClose } = useDisclosure(); // Correctly initialized

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  const toast = useToast();

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }
    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
    console.log(userId);

    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };
  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px"
        borderWidth="5px"
      >
        {/* Tooltip and Button correctly trigger onOpen */}
        <Tooltip label="Search Users to Chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            {" "}
            {/* Trigger Drawer open */}
            <i className="fa-solid fa-magnifying-glass"></i>
            <Text display={{ base: "none", md: "flex" }} px="4">
              Search User{" "}
            </Text>
          </Button>
        </Tooltip>

        <Text
          fontSize="2xl"
          fontFamily="Helvetica Neue"
          color="Orange"
          fontWeight="bold"
        >
          Yapp
        </Text>

        <div style={{ display: "flex", alignItems: "center" }}>
          <Box position="relative">
            <Menu>
              <MenuButton p={1} mr={1} position="relative">
                <BellIcon fontSize="2xl" />

                {/* Chakra Badge for notifications */}
                {notification.length > 0 && (
                  <Badge
                    colorScheme="red"
                    borderRadius="full"
                    position="absolute"
                    top="-1"
                    right="-1"
                    fontSize="0.7em"
                    px={2}
                  >
                    {notification.length}
                  </Badge>
                )}
              </MenuButton>

              <MenuList pl={2}>
                {!notification.length && "No New Messages"}
                {notification.map((notif) => (
                  <MenuItem
                    key={notif._id}
                    onClick={() => {
                      setSelectedChat(notif.chat);
                      setNotification(notification.filter((n) => n !== notif));
                    }}
                  >
                    {notif.chat.isGroupChat
                      ? `New Message in ${notif.chat.chatName}`
                      : `New Message from ${getSender(user, notif.chat.users)}`}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </Box>

          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              rightIcon={<ChevronDownIcon />}
            >
              <Avatar
                size="sm"
                cursor="pointer"
                name={user?.name}
                src={user?.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      {/* Drawer Component */}
      {/* Correct prop usage: isOpen={isOpen} controls visibility */}
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>{" "}
          {/* Corrected typo */}
          {/* Add DrawerBody for content */}
          <DrawerBody>
            <Box display="flex" pb={2}>
              {" "}
              {/* Use Box with display flex */}
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch} isLoading={loading}>
                Go
              </Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
