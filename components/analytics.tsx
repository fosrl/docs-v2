import Script from 'next/script';

/**
 * Same analytics as the Mintlify site (PostHog via the pangolin.net relay, Rybbit, Reo).
 * Only loaded in production builds; set NEXT_PUBLIC_DISABLE_ANALYTICS=1 to turn off.
 */
const POSTHOG_KEY = 'phc_RIHQ7o2Y2hf8qms2nP62vpoJHEvsrw6TieflQGQO7yI';
const POSTHOG_HOST = 'https://pangolin.net/relay-O7yI';
const RYBBIT_SITE_ID = 'da4fb64dc2d5';
const REO_CLIENT_ID = '4209f8e1b88e13b';

export function Analytics() {
  if (process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_DISABLE_ANALYTICS) {
    return null;
  }

  return (
    <>
      <Script id="posthog" strategy="afterInteractive">
        {`!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
posthog.init(${JSON.stringify(POSTHOG_KEY)},{api_host:${JSON.stringify(POSTHOG_HOST)},ui_host:'https://us.posthog.com',person_profiles:'identified_only'});`}
      </Script>
      <Script
        src={`https://rybbit.fossorial.io/api/script.js?siteId=${RYBBIT_SITE_ID}`}
        strategy="afterInteractive"
      />
      <Script
        src={`https://static.reo.dev/${REO_CLIENT_ID}/reo.js`}
        strategy="afterInteractive"
        id="reo"
      />
      <Script id="reo-init" strategy="lazyOnload">
        {`(function w(){if(window.Reo){Reo.init({clientID:${JSON.stringify(REO_CLIENT_ID)}})}else setTimeout(w,500)})();`}
      </Script>
    </>
  );
}
