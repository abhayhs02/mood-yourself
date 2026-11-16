const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');

function ensureApiUrl() {
  if (!API_URL) {
    throw new Error(
      'VITE_API_URL is missing. Check .env.local and restart Vite.'
    );
  }
}

async function parseResponse(response) {
  const rawBody = await response.text();

  if (!rawBody) {
    return {};
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    throw new Error(
      `The API returned invalid JSON with status ${response.status}.`
    );
  }
}

export async function getWeekMoods(
  startDate,
  endDate
) {
  ensureApiUrl();

  const parameters = new URLSearchParams({
    startDate,
    endDate,
  });

  const response = await fetch(
    `${API_URL}/moods?${parameters.toString()}`,
    {
      method: 'GET',
    }
  );

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      data.message || 'Unable to load moods.'
    );
  }

  return data;
}

export async function saveMood(
  mood,
  moodDate,
  imageKey = null
) {
  ensureApiUrl();

  const response = await fetch(
    `${API_URL}/moods`,
    {
      method: 'PUT',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        mood,
        moodDate,
        imageKey,
      }),
    }
  );

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      data.message || 'Unable to save mood.'
    );
  }

  return data;
}

export async function requestImageUpload(
  moodDate,
  file
) {
  ensureApiUrl();

  const response = await fetch(
    `${API_URL}/moods/image-upload`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        moodDate,
        fileName: file.name,
        contentType: file.type,
      }),
    }
  );

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Unable to prepare image upload.'
    );
  }

  return data;
}

export async function uploadImageToS3(
  uploadUrl,
  file
) {
  const response = await fetch(
    uploadUrl,
    {
      method: 'PUT',

      headers: {
        'Content-Type': file.type,
      },

      body: file,
    }
  );

  if (!response.ok) {
    throw new Error(
      'Unable to upload image to S3.'
    );
  }
}