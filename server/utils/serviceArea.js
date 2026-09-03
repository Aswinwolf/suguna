/**
 * Service-area restriction: the whole app currently operates in Erode only.
 * City and State are fixed; only Erode-region pincodes (638xxx) are accepted.
 */
export const SERVICE_CITY = 'Erode';
export const SERVICE_STATE = 'Tamil Nadu';
export const ERODE_PINCODE_REGEX = /^638\d{3}$/;

export const isErodePincode = (pincode) => ERODE_PINCODE_REGEX.test(String(pincode || '').trim());

/**
 * Force the fixed city/state onto an address payload and validate the pincode.
 * Returns { ok, message?, data? }.
 */
export const enforceServiceArea = (data) => {
  if (!isErodePincode(data.pincode)) {
    return {
      ok: false,
      message: 'We currently serve Erode only. Please enter a valid Erode pincode (638xxx).',
    };
  }
  return {
    ok: true,
    data: { ...data, city: SERVICE_CITY, state: SERVICE_STATE },
  };
};
