import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Flex,
  Input,
  Button,
  Progress,
} from "@chakra-ui/react";
import MintComponent from "../MintComponent";

// Replace test data with your own
const features = Array.apply(null, Array(8)).map(function (x, i) {
  return {
    id: i,
    title: "Lorem ipsum dolor sit amet",
    text: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam.",
  };
});

export default function MintSection() {
  return (
    <Box p={{ base: 2, md: 4 }} mt="16" id="mint">
      <Stack spacing={4} as={Container} textAlign={"center"}>
        <Heading
          fontSize={"3xl"}
          textTransform="capitalize"
          fontFamily="ClashDisplay-SemiBold"
        >
          Own a camel in the sahara
        </Heading>
        <Text color={"gray.600"} fontSize={"md"}>
          Presale Live!
        </Text>
      </Stack>

      <Flex width="100%" mt={10} justifyContent="center" alignItems="center">
        <Stack width={{ base: "100%", md: "50%" }}>
          <Stack direction="column">
            <Text
              textAlign="center"
              fontFamily="ClashDisplay-SemiBold"
              fontSize={{
                base: "5xl",
              }}
            >
              9,999 Camels
            </Text>
            <Progress
              value={80}
              borderRadius="10px"
              background="linear-gradient(97.36deg, #7234F5 0%, #3D70F0 100%)"
            />
          </Stack>
        </Stack>
      </Flex>

      <MintComponent />
    </Box>
  );
}
