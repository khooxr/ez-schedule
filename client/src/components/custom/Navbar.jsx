import {
  Box,
  Button,
  Flex,
  HStack,
  Link as ChakraLink,
  IconButton,
  AvatarRoot,
  AvatarImage,
  AvatarFallback,
  Spacer,
} from "@chakra-ui/react";
import { FiLogOut, FiUser } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { ColorModeButton } from "@/components/ui/color-mode";
import { useState, useEffect } from "react";
import { API_URL } from "../../services/api";

const links = [{ to: "/", text: "About" }];

const Navbar = () => {
  const userId = localStorage.getItem("userId");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId !== null) {
      fetch(`${API_URL}/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((response) => response.json())
        .then((user) => {
          setUser(user);
        });
    }
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/");
  };

  return (
    <Box px={6} py={2} borderBottom="1px solid gray">
      <Flex align="center" gap={6}>
        <Box fontWeight="bold" fontSize="xl" mr={4}>
          {user === null ? (
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              EzSchedule
            </Link>
          ) : (
              user.userRole === "host" ? (
              <Link to="/user/groups" style={{ textDecoration: 'none', color: 'inherit' }}>
                EzSchedule
              </Link>
            ) : (
              <Link to="/user/groups" style={{ textDecoration: 'none', color: 'inherit' }}>
              EzSchedule
            </Link>
            )
          )}
            
        </Box>

        <HStack spacing={4} display={{ base: "none", md: "flex" }}>
          {links.map((link) => (
            <ChakraLink as={Link} to={link.to} key={link.to}>
              {link.text}
            </ChakraLink>
          ))}
        </HStack>

        {/* Icons */}
        <Spacer />
        <ColorModeButton />
        {user !== null ? 
          (<HStack spacing={3}>
          <IconButton
            aria-label="Logout"
            variant="ghost"
            size="md"
            onClick={handleLogout}
          >
            <FiLogOut />
          </IconButton>
          <AvatarRoot as={Link} to={`/users/${userId}`} size="sm">
            {user?.profilePicture && <AvatarImage src={user.profilePicture} />}
            <AvatarFallback>
              <FiUser />
            </AvatarFallback>
          </AvatarRoot>
        </HStack>) : (
        <HStack spacing={3}>
          <Button variant="outline" onClick={() => navigate("/login")}>Login</Button>
          <Button variant="outline" onClick={() => navigate("/register")}>Register</Button>
        </HStack>
        )}
      </Flex>
    </Box>
  );
};

export default Navbar;
