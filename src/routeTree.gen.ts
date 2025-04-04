/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as SignInImport } from './routes/sign-in'
import { Route as SettingsRouteImport } from './routes/settings/route'
import { Route as SearchRouteImport } from './routes/search/route'
import { Route as UsernameRouteImport } from './routes/$username/route'
import { Route as IndexImport } from './routes/index'
import { Route as FeedIndexImport } from './routes/feed/index'
import { Route as FeedIdImport } from './routes/feed/$id'
import { Route as UsernamePostsImport } from './routes/$username/posts'
import { Route as UsernameFriendsImport } from './routes/$username/friends'

// Create/Update Routes

const SignInRoute = SignInImport.update({
  id: '/sign-in',
  path: '/sign-in',
  getParentRoute: () => rootRoute,
} as any)

const SettingsRouteRoute = SettingsRouteImport.update({
  id: '/settings',
  path: '/settings',
  getParentRoute: () => rootRoute,
} as any)

const SearchRouteRoute = SearchRouteImport.update({
  id: '/search',
  path: '/search',
  getParentRoute: () => rootRoute,
} as any)

const UsernameRouteRoute = UsernameRouteImport.update({
  id: '/$username',
  path: '/$username',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const FeedIndexRoute = FeedIndexImport.update({
  id: '/feed/',
  path: '/feed/',
  getParentRoute: () => rootRoute,
} as any)

const FeedIdRoute = FeedIdImport.update({
  id: '/feed/$id',
  path: '/feed/$id',
  getParentRoute: () => rootRoute,
} as any)

const UsernamePostsRoute = UsernamePostsImport.update({
  id: '/posts',
  path: '/posts',
  getParentRoute: () => UsernameRouteRoute,
} as any)

const UsernameFriendsRoute = UsernameFriendsImport.update({
  id: '/friends',
  path: '/friends',
  getParentRoute: () => UsernameRouteRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/$username': {
      id: '/$username'
      path: '/$username'
      fullPath: '/$username'
      preLoaderRoute: typeof UsernameRouteImport
      parentRoute: typeof rootRoute
    }
    '/search': {
      id: '/search'
      path: '/search'
      fullPath: '/search'
      preLoaderRoute: typeof SearchRouteImport
      parentRoute: typeof rootRoute
    }
    '/settings': {
      id: '/settings'
      path: '/settings'
      fullPath: '/settings'
      preLoaderRoute: typeof SettingsRouteImport
      parentRoute: typeof rootRoute
    }
    '/sign-in': {
      id: '/sign-in'
      path: '/sign-in'
      fullPath: '/sign-in'
      preLoaderRoute: typeof SignInImport
      parentRoute: typeof rootRoute
    }
    '/$username/friends': {
      id: '/$username/friends'
      path: '/friends'
      fullPath: '/$username/friends'
      preLoaderRoute: typeof UsernameFriendsImport
      parentRoute: typeof UsernameRouteImport
    }
    '/$username/posts': {
      id: '/$username/posts'
      path: '/posts'
      fullPath: '/$username/posts'
      preLoaderRoute: typeof UsernamePostsImport
      parentRoute: typeof UsernameRouteImport
    }
    '/feed/$id': {
      id: '/feed/$id'
      path: '/feed/$id'
      fullPath: '/feed/$id'
      preLoaderRoute: typeof FeedIdImport
      parentRoute: typeof rootRoute
    }
    '/feed/': {
      id: '/feed/'
      path: '/feed'
      fullPath: '/feed'
      preLoaderRoute: typeof FeedIndexImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

interface UsernameRouteRouteChildren {
  UsernameFriendsRoute: typeof UsernameFriendsRoute
  UsernamePostsRoute: typeof UsernamePostsRoute
}

const UsernameRouteRouteChildren: UsernameRouteRouteChildren = {
  UsernameFriendsRoute: UsernameFriendsRoute,
  UsernamePostsRoute: UsernamePostsRoute,
}

const UsernameRouteRouteWithChildren = UsernameRouteRoute._addFileChildren(
  UsernameRouteRouteChildren,
)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/$username': typeof UsernameRouteRouteWithChildren
  '/search': typeof SearchRouteRoute
  '/settings': typeof SettingsRouteRoute
  '/sign-in': typeof SignInRoute
  '/$username/friends': typeof UsernameFriendsRoute
  '/$username/posts': typeof UsernamePostsRoute
  '/feed/$id': typeof FeedIdRoute
  '/feed': typeof FeedIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/$username': typeof UsernameRouteRouteWithChildren
  '/search': typeof SearchRouteRoute
  '/settings': typeof SettingsRouteRoute
  '/sign-in': typeof SignInRoute
  '/$username/friends': typeof UsernameFriendsRoute
  '/$username/posts': typeof UsernamePostsRoute
  '/feed/$id': typeof FeedIdRoute
  '/feed': typeof FeedIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/$username': typeof UsernameRouteRouteWithChildren
  '/search': typeof SearchRouteRoute
  '/settings': typeof SettingsRouteRoute
  '/sign-in': typeof SignInRoute
  '/$username/friends': typeof UsernameFriendsRoute
  '/$username/posts': typeof UsernamePostsRoute
  '/feed/$id': typeof FeedIdRoute
  '/feed/': typeof FeedIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/$username'
    | '/search'
    | '/settings'
    | '/sign-in'
    | '/$username/friends'
    | '/$username/posts'
    | '/feed/$id'
    | '/feed'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/$username'
    | '/search'
    | '/settings'
    | '/sign-in'
    | '/$username/friends'
    | '/$username/posts'
    | '/feed/$id'
    | '/feed'
  id:
    | '__root__'
    | '/'
    | '/$username'
    | '/search'
    | '/settings'
    | '/sign-in'
    | '/$username/friends'
    | '/$username/posts'
    | '/feed/$id'
    | '/feed/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  UsernameRouteRoute: typeof UsernameRouteRouteWithChildren
  SearchRouteRoute: typeof SearchRouteRoute
  SettingsRouteRoute: typeof SettingsRouteRoute
  SignInRoute: typeof SignInRoute
  FeedIdRoute: typeof FeedIdRoute
  FeedIndexRoute: typeof FeedIndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  UsernameRouteRoute: UsernameRouteRouteWithChildren,
  SearchRouteRoute: SearchRouteRoute,
  SettingsRouteRoute: SettingsRouteRoute,
  SignInRoute: SignInRoute,
  FeedIdRoute: FeedIdRoute,
  FeedIndexRoute: FeedIndexRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/$username",
        "/search",
        "/settings",
        "/sign-in",
        "/feed/$id",
        "/feed/"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/$username": {
      "filePath": "$username/route.tsx",
      "children": [
        "/$username/friends",
        "/$username/posts"
      ]
    },
    "/search": {
      "filePath": "search/route.tsx"
    },
    "/settings": {
      "filePath": "settings/route.tsx"
    },
    "/sign-in": {
      "filePath": "sign-in.tsx"
    },
    "/$username/friends": {
      "filePath": "$username/friends.tsx",
      "parent": "/$username"
    },
    "/$username/posts": {
      "filePath": "$username/posts.tsx",
      "parent": "/$username"
    },
    "/feed/$id": {
      "filePath": "feed/$id.tsx"
    },
    "/feed/": {
      "filePath": "feed/index.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
