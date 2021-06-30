import { Box, Button, Flex, Link } from '@chakra-ui/react';
import React from 'react'
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from '../generated/graphql';

interface NavBarProps { }

export const NavBar: React.FC<NavBarProps> = ({ }) => {
    const [{ data, fetching }] = useMeQuery()
    const [{fetching: logoutFetching}, logout] = useLogoutMutation()
    let body = null
    //data is loading
    if (fetching) { }
    //user not logged in
    if (!data?.me) {
        body =
            (<>
                <NextLink href="/login">
                    <Link mr={2}>Login</Link>
                </NextLink>

                <NextLink href="/register">
                    <Link >Register</Link>
                </NextLink>
            </>
            )
    }
    // user logged in
    if (data?.me) {
        body = (
            <Flex>
                <Box mr={3}>{data.me.username}</Box>
                <Button
                    isLoading={logoutFetching}
                    variant="link"
                    onClick={() => logout()}
                >
                    Logout</Button>
            </Flex>
        )
    }

    return (
        <Flex bg={"#D6BCFA"} p={4}>
            <Box ml={'auto'}>
                {body}
            </Box>
        </Flex>
    );
}