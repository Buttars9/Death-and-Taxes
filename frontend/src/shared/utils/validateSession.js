import axios from 'axios';

export async function validateSession(email, password) {
  try {
    const response = await axios.post('/api/login', {
      email,
      password,
    });

    const timestamp = new Date().toISOString();
    const statusCode = response.status;
    const authVersion = 'v1.0';

    if (response.data?.success) {
      return {
        success: true,
        user: response.data.user,
        token: response.data.token,
        timestamp,
        statusCode,
        authVersion,
      };
    } else {
      return {
        success: false,
        error: response.data?.error || 'Invalid credentials',
        timestamp,
        statusCode,
        authVersion,
      };
    }
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || 'Server error',
      timestamp: new Date().toISOString(),
      statusCode: err.response?.status || 500,
      authVersion: 'v1.0',
    };
  }
}