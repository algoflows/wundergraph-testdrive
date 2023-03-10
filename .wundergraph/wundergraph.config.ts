import {
  authProviders,
  configureWunderGraphApplication,
  cors,
  EnvironmentVariable,
  introspect,
  templates,
} from "@wundergraph/sdk";
import { NextJsTemplate } from "@wundergraph/nextjs/dist/template";
import server from "./wundergraph.server";
import operations from "./wundergraph.operations";

const spaceX = introspect.graphql({
  apiNamespace: "spacex",
  url: "https://spacex-api.fly.dev/graphql/",
});

const countries = introspect.graphql({
  apiNamespace: "countries",
  url: "https://countries.trevorblades.com/",
});

const graphbrainz = introspect.graphql({
  apiNamespace: "graphbrainz",
  url: "https://graphbrainz.fly.dev/",
});

const todo = introspect.postgresql({
  apiNamespace: "todo",
  databaseURL: process.env.DATABASE_URL,
});

// configureWunderGraph emits the configuration
configureWunderGraphApplication({
  apis: [spaceX, todo, graphbrainz, countries],
  server,
  operations,
  codeGenerators: [
    {
      templates: [...templates.typescript.all],
    },
    {
      templates: [new NextJsTemplate()],
      path: "../components/generated",
    },
  ],
  cors: {
    ...cors.allowAll,
    allowedOrigins:
      process.env.NODE_ENV === "production" ? ["https://*"] : ["http://*"],
    /**
     * Please configure CORS carefully to make sure that your users are protected.
     * Allowing all origins is usually the worst possible configuration.
     *
     * @docs https://docs.wundergraph.com/docs/wundergraph-config-ts-reference/configure-cors
     */
    // allowedOrigins: process.env.NODE_ENV === 'production' ? ['http://your.app'] : ['http://localhost:3000'],
  },
  authentication: {
    cookieBased: {
      providers: [authProviders.demo()],
      authorizedRedirectUris: ["http://localhost:3000"],
      secureCookieHashKey: new EnvironmentVariable(
        "WUNDERGRAPH_SECURE_COOKIE_HASH_KEY",
        "00000000000000000000000000000000"
      ), // must be of length 32
      secureCookieBlockKey: new EnvironmentVariable(
        "WUNDERGRAPH_SECURE_COOKIE_BLOCK_KEY",
        "00000000000000000000000000000000"
      ), // must be of length 32
      csrfTokenSecret: new EnvironmentVariable(
        "WUNDERGRAPH_CSRF_TOKEN_SECRET",
        "00000000000"
      ), // must be of length 11
    },
  },
  security: {
    enableGraphQLEndpoint: process.env.NODE_ENV !== "production",
  },
});
