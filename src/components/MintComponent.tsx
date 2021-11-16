import React, { useContext } from "react";
import { injected } from "../ethereum/connectors";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { useEagerConnect, useInactiveListener } from "../ethereum/hooks";
import firebase from "../lib/firebase";

import useStepper from "use-stepper";
import web3 from "../ethereum/web3";
import {
  Box,
  Button,
  Flex,
  Stack,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";

import AppContract from "../assets/abi.json";
import { ContractContext } from "../context/contract";
import { useAuth } from "../context/AuthUserContext";
// const CONTRACT_ADDRESS = AppContract.networks["1"].address;

// console.log("CONTRACT_ADDRESS", CONTRACT_ADDRESS);

const min = 1;
const defaultValue = 1;
const max = 12;

enum ConnectorNames {
  Injected = "Injected",
}

const connectorsByName: { [connectorName in ConnectorNames]: any } = {
  [ConnectorNames.Injected]: injected,
};
function MintComponent() {
  const [supply, setTotalSupply] = React.useState(0);

  const context = useWeb3React<Web3Provider>();
  const {
    connector,
    library,
    chainId,
    account,
    activate,
    deactivate,
    active,
    error,
  } = context;

  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = React.useState<any>();
  const [instance, setInstance] = React.useState<any>(null);
  const [accounts, setAccounts] = React.useState([]);
  const [count, setCount] = React.useState(1);
  const [hidden, setHidden] = React.useState(true);

  React.useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);

  const { authUser, loading, signOut } = useAuth();
  // const router = useRouter();
  // Listen for changes on loading and authUser, redirect if needed
  React.useEffect(() => {
    !loading && authUser ? setHidden(false) : setHidden(true);
  }, [authUser, loading]);

  React.useEffect(() => {
    if (instance) {
      const getSupply = async () => {
        const totalSupply = await instance.methods.totalSupply().call();
        setTotalSupply(totalSupply);
      };

      getSupply();
    }
  }, [instance]);

  React.useEffect(() => {
    const init = async () => {
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();

      const instance = new web3.eth.Contract(
        // @ts-ignore
        AppContract,
        "0x80c265244b42d2152247d795133f7F2038686D67"
      );

      setAccounts(accounts);
      setInstance(instance);
    };

    init();
  }, []);

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect();

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector);
  const currentConnector = connectorsByName["Injected"];
  const activating = currentConnector === activatingConnector;
  const connected = currentConnector === connector;
  const disabled = !triedEager || !!activatingConnector || connected || !!error;

  function validValueClosestTo(desiredNumericValue) {
    return String(Math.min(max, Math.max(desiredNumericValue, min)));
  }

  function integerReducer(state, action) {
    const integerValue = parseInt(state.value, 10);
    switch (action.type) {
      case useStepper.actionTypes.increment: {
        return { value: validValueClosestTo(integerValue + 1) };
      }
      case useStepper.actionTypes.decrement: {
        return { value: validValueClosestTo(integerValue - 1) };
      }
      case useStepper.actionTypes.coerce: {
        if (Number.isNaN(integerValue)) {
          return { value: String(defaultValue) };
        }
        const newValue = validValueClosestTo(integerValue);
        if (newValue !== state.value) {
          return { value: newValue };
        }
        return state;
      }
      default:
        return useStepper.defaultReducer(state, action);
    }
  }

  const mint = async () => {
    try {
      if (!instance) throw new Error(`No Ethereum Instance.`);

      if (!account)
        throw new Error(`No account selected. Try reauthenticating`);
      const amount = (0.069 * (count as any)).toFixed(3);
      // const nonceResponse = await fetch(
      //   `/pro-camel-riders/us-central1/getNonce?address=${account}`
      // );
      // const data = await nonceResponse.json();

      // const signature = await web3!.eth.personal.sign(
      //   `I am signing my one-time nonce: ${data.nonce}`,
      //   account,
      //   "" // MetaMask will ignore the password argument here
      // );

      // const verificationResponse = await fetch(
      //   `/pro-camel-riders/us-central1/verifyAddress?address=${account}&signature=${signature}`
      // );
      // const verificationData = await verificationResponse.json();
      const value = web3.utils.toWei(amount, "ether");

      const gas = (count) => {
        switch (true) {
          case Number(count) > 1 && Number(count) <= 3:
            return "250000";
          case Number(count) > 3 && Number(count) <= 6:
            return "450000";
          case Number(count) > 6 && Number(count) <= 9:
            return "600000";
          case Number(count) > 6 && Number(count) <= 9:
            return "600000";
          case Number(count) > 9 && Number(count) <= 12:
            return "750000";
          case Number(count) > 12 && Number(count) <= 15:
            return "850000";
          case Number(count) > 15:
            return "950000";
        }
      };

      await instance.methods.mint(count).send({
        from: account,
        value,
        gas: gas(count),
      });
      // const gas = await tx.estimateGas({ from: account });
      // const gasPrice = await web3.eth.getGasPrice();
      // const data = tx.encodeABI();
      // const nonce = await web3.eth.getTransactionCount(account);

      // console.log({
      //   gas,
      //   gasPrice,
      //   nonce,
      //   data,
      // });
    } catch (error) {
      console.log(error);
    }
  };

  const connect = async () => {
    try {
      console.log("Connecting", connected);
      // Verify address is in Presales.
      // await
      //Retrieve current nonce.
      // After presales.
      setActivatingConnector(currentConnector);
      activate(connectorsByName["Injected"]);
    } catch (error) {
      console.log(error, "Error");
    }
  };

  const contract = useContext(ContractContext);

  React.useEffect(() => {
    console.log("Contract", contract);
  }, [contract]);
  return (
    <Flex width="100%" mt={10} justifyContent="center" alignItems="center">
      <Stack width="100%" align="center">
        <Stack
          width={{ base: "100%", md: "40%" }}
          direction={{ base: "column", md: "row" }}
          textAlign="center"
          align="center"
        >
          <NumberInput
            variant="outline"
            placeholder="Amount"
            defaultValue={1}
            min={min}
            max={max}
            onChange={(e) => setCount(Number(e))}
            size="lg"
          >
            <NumberInputField readOnly textAlign="center" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          {!connected && (
            <Button
              size={"lg"}
              fontWeight={"normal"}
              fontFamily="Satoshi-Medium"
              borderRadius="3px"
              fontSize="16px"
              background="linear-gradient(97.36deg, #7234F5 0%, #3D70F0 100%), linear-gradient(97.36deg, #00A272 0%, #00A298 100%), #00A272"
              // disabled={disabled}
              onClick={connect}
            >
              Connect Wallet
            </Button>
          )}
          {active && (
            <Button
              size={"lg"}
              fontWeight={"normal"}
              fontFamily="Satoshi-Medium"
              borderRadius="3px"
              fontSize="16px"
              background="linear-gradient(97.36deg, #7234F5 0%, #3D70F0 100%), linear-gradient(97.36deg, #00A272 0%, #00A298 100%), #00A272"
              onClick={mint}
            >
              Mint
            </Button>
          )}
          {/* <Box height="200px" background="red" width="200px">
            {JSON.stringify(hidden)}: Here
            {JSON.stringify(authUser)}: user
            {JSON.stringify(loading)}: user
            {JSON.stringify(account)}: account
            {JSON.stringify(accounts)}: accounts
          </Box> */}
        </Stack>
      </Stack>
    </Flex>
  );
}

export default MintComponent;
