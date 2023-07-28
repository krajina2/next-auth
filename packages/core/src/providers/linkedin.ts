/**
 * <div style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>Built-in <b>Linkedin</b> integration.</span>
 * <a href="https://linkedin.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/linkedin.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/linkedin
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

interface Identifier {
  identifier: string
}

interface Element {
  identifiers?: Identifier[]
}

export interface LinkedInProfile extends Record<string, any> {
  id: string
  localizedFirstName: string
  localizedLastName: string
  profilePicture: {
    "displayImage~": {
      elements?: Element[]
    }
  }
}

/**
 * Add Linkedin login to your page.
 *
 * ### Setup
 *
 * #### Callback URL
 * ```
 * https://example.com/api/auth/callback/linkedin
 * ```
 *
 * #### Configuration
 *```js
 * import Auth from "@auth/core"
 * import Linkedin from "@auth/core/providers/linkedin"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [Linkedin({ clientId: LINKEDIN_CLIENT_ID, clientSecret: LINKEDIN_CLIENT_SECRET })],
 * })
 * ```
 *
 * ### Resources
 *
 *  - [Linkedin OAuth documentation](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow)
 *  - [Linkedin app console](https://www.linkedin.com/developers/apps/)
 *
 * ### Notes
 *
 * By default, Auth.js assumes that the Linkedin provider is
 * based on the [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) specification.
 *
 * :::tip
 *
 * The Linkedin provider comes with a [default configuration](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/linkedin.ts).
 * To override the defaults for your use case, check out [customizing a built-in OAuth provider](https://authjs.dev/guides/providers/custom-provider#override-default-options).
 *
 * :::
 *
 * :::info **Disclaimer**
 *
 * If you think you found a bug in the default configuration, you can [open an issue](https://authjs.dev/new/provider-issue).
 *
 * Auth.js strictly adheres to the specification and it cannot take responsibility for any deviation from
 * the spec by the provider. You can open an issue, but if the problem is non-compliance with the spec,
 * we might not pursue a resolution. You can ask for more help in [Discussions](https://authjs.dev/new/github-discussions).
 *
 * :::
 */
export default function LinkedIn<P extends LinkedInProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "linkedin",
    name: "LinkedIn",
    type: "oauth",
    authorization: {
      url: "https://www.linkedin.com/oauth/v2/authorization",
      params: { scope: "r_liteprofile r_emailaddress w_member_social" },
    },
    token: "https://www.linkedin.com/oauth/v2/accessToken",
    client: {
      token_endpoint_auth_method: "client_secret_post",
    },
    userinfo: {
      url: "https://api.linkedin.com/v2/me",
      params: {
        projection: `(id,localizedFirstName,localizedLastName,profilePicture(displayImage~digitalmediaAsset:playableStreams))`,
      },
    },
    async profile(profile, tokens) {
      const emailResponse = await fetch(
        "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
        { headers: { Authorization: `Bearer ${tokens.access_token}` } }
      )
      const emailData = await emailResponse.json()
      return {
        id: profile.id,
        name: `${profile.localizedFirstName} ${profile.localizedLastName}`,
        email: emailData?.elements?.[0]?.["handle~"]?.emailAddress,
        image:
          profile.profilePicture?.["displayImage~"]?.elements?.[0]
            ?.identifiers?.[0]?.identifier,
      }
    },
    style: {
      logo: "/linkedin.svg",
      logoDark: "/linkedin-dark.svg",
      bg: "#fff",
      text: "#069",
      bgDark: "#069",
      textDark: "#fff",
    },
    options,
  }
}
