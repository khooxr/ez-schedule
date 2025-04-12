import {
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
  Flex,
  Button,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { joinQueue, leaveGroup } from "@/services/api";
import { formatSlotTime } from "@/utils/dateUtils";
import { useTimeslots } from "@/hooks/useTimeslots";
import { useParams, useNavigate } from "react-router-dom";

const GroupPage = () => {
  const { timeslots, loading, loadTimeslots } = useTimeslots();
  const { id: groupId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadTimeslots();
  }, []);

  const handleJoin = async (slotId) => {
    try {
      await joinQueue(slotId);
    } catch (err) {
      console.error("Failed to join queue", err);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await leaveGroup(groupId);
      navigate("/user/groups");
    } catch (err) {
      console.error("Failed to leave group", err);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box px={6} py={8} maxW="5xl" mx="auto">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Available Consultations</Heading>
        <Button onClick={handleLeaveGroup} colorScheme="red">
          Leave Group
        </Button>
      </Flex>
      <VStack spacing={4} align="stretch">
        {timeslots.length === 0 ? (
          <Text>No open consultations available right now.</Text>
        ) : (
          timeslots.map((slot) => (
            <Box key={slot._id} p={4} borderWidth="1px" borderRadius="md">
              <Heading size="md">{slot.name}</Heading>
              <Text color="gray.600">
                {formatSlotTime(slot.start)} - {formatSlotTime(slot.end)}
              </Text>
              <Text mt={2}>Location: {slot.location || "Not specified"}</Text>
              <Button
                mt={4}
                onClick={() => !slot.isClosed && handleJoin(slot._id)}
                isDisabled={slot.isClosed}
              >
                {slot.isClosed ? "Closed" : "Join Queue"}
              </Button>
            </Box>
          ))
        )}
      </VStack>
    </Box>
  );
};

export default GroupPage;
