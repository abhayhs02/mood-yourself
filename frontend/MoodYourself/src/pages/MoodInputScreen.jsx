import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  LoaderCircle,
  LogOut,
  Save,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';

import {
  getWeekMoods,
  requestImageUpload,
  saveMood,
  uploadImageToS3,
} from '../services/api';

/* ---------------------------------------------------------
 * DATE AND CALENDAR HELPERS
 * --------------------------------------------------------- */

function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getMondayOfWeek(date) {
  const result = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const day = result.getDay();
  const difference = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + difference);
  result.setHours(0, 0, 0, 0);

  return result;
}

function addDays(date, numberOfDays) {
  const result = new Date(date);

  result.setDate(result.getDate() + numberOfDays);
  result.setHours(0, 0, 0, 0);

  return result;
}

function generateWeekDays(mondayDate) {
  return Array.from({ length: 7 }, (_, index) =>
    addDays(mondayDate, index)
  );
}

function getDayStatus(targetDate, todayKey) {
  const targetKey = getLocalDateKey(targetDate);

  if (targetKey === todayKey) {
    return 'TODAY';
  }

  return targetKey < todayKey ? 'PAST' : 'FUTURE';
}

function formatWeekRange(startDate, endDate) {
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();

  const startMonth = startDate.toLocaleDateString(undefined, {
    month: 'short',
  });

  const endMonth = endDate.toLocaleDateString(undefined, {
    month: 'short',
  });

  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  if (startYear !== endYear) {
    return `${startDay} ${startMonth} ${startYear} – ${endDay} ${endMonth} ${endYear}`;
  }

  if (startMonth !== endMonth) {
    return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${startYear}`;
  }

  return `${startDay} – ${endDay} ${startMonth} ${startYear}`;
}

function getDateStatusLabel(status) {
  if (status === 'TODAY') {
    return 'Today';
  }

  if (status === 'PAST') {
    return 'Past date';
  }

  return 'Future date';
}

/* ---------------------------------------------------------
 * MAIN COMPONENT
 * --------------------------------------------------------- */

function MoodInputScreen({ user, onLogout }) {
  const userName = user?.name?.trim() || 'Friend';
  const userEmail = user?.email?.trim() || '';

  const [todayDate] = useState(() => new Date());
  const todayKey = getLocalDateKey(todayDate);

  const [currentMonday, setCurrentMonday] = useState(() =>
    getMondayOfWeek(new Date())
  );

  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const selectedKey = getLocalDateKey(selectedDate);
  const selectedStatus = getDayStatus(selectedDate, todayKey);

  const [entries, setEntries] = useState({});

  const [moodText, setMoodText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  const [fileError, setFileError] = useState('');
  const [apiError, setApiError] = useState('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [isLoadingMoods, setIsLoadingMoods] = useState(false);
  const [isSavingMood, setIsSavingMood] = useState(false);

  const fileInputRef = useRef(null);
  const successTimerRef = useRef(null);
  const currentBlobUrlRef = useRef(null);

  const weekDays = useMemo(
    () => generateWeekDays(currentMonday),
    [currentMonday]
  );

  const weekEndDay = weekDays[6];

  const currentWeekMondayKey = getLocalDateKey(
    getMondayOfWeek(todayDate)
  );

  const isCurrentWeekDisplayed =
    getLocalDateKey(currentMonday) === currentWeekMondayKey;

  const activeEntryForSelected = entries[selectedKey];

  /* ---------------------------------------------------------
   * LOAD DISPLAYED WEEK FROM BACKEND
   * --------------------------------------------------------- */

  useEffect(() => {
    let isCancelled = false;

    async function loadWeekMoods() {
      const startDate = getLocalDateKey(currentMonday);
      const endDate = getLocalDateKey(
        addDays(currentMonday, 6)
      );

      try {
        setIsLoadingMoods(true);
        setApiError('');

        const data = await getWeekMoods(
          startDate,
          endDate
        );

        if (isCancelled) {
          return;
        }

        const mappedEntries = {};

        for (const item of data.items || []) {
          if (!item?.moodDate) {
            continue;
          }

          mappedEntries[item.moodDate] = {
            moodDate: item.moodDate,
            mood: item.mood || '',
            imageUrl: item.imageUrl || null,
            imageKey: item.imageKey || null,
            updatedAt: item.updatedAt || null,
          };
        }

        setEntries((previousEntries) => {
          const updatedEntries = {
            ...previousEntries,
          };

          for (const date of weekDays) {
            const dateKey = getLocalDateKey(date);
            const existingEntry = updatedEntries[dateKey];

            /*
             * Remove stale backend records for the refreshed week.
             * Preserve unsaved browser blob previews until S3 is added.
             */
            if (
              !existingEntry?.imageUrl?.startsWith('blob:')
            ) {
              delete updatedEntries[dateKey];
            }
          }

          return {
            ...updatedEntries,
            ...mappedEntries,
          };
        });
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.error(
          'Failed to load moods:',
          error
        );

        setApiError(
          error instanceof Error
            ? error.message
            : 'Unable to load your moods. Please try again.'
        );
      } finally {
        if (!isCancelled) {
          setIsLoadingMoods(false);
        }
      }
    }

    loadWeekMoods();

    return () => {
      isCancelled = true;
    };
  }, [currentMonday, weekDays]);

  /* ---------------------------------------------------------
   * SYNCHRONIZE EDITOR WITH SELECTED DATE
   * --------------------------------------------------------- */

  useEffect(() => {
    const selectedEntry = entries[selectedKey];
    const nextImageUrl =
      selectedEntry?.imageUrl || null;

    setMoodText(selectedEntry?.mood || '');
    setImageFile(null);
    setFileError('');
    setSaveSuccessMessage('');

    /*
     * Revoke the previous local object URL only when switching
     * to a different image or date.
     */
    if (
      currentBlobUrlRef.current &&
      currentBlobUrlRef.current !== nextImageUrl
    ) {
      URL.revokeObjectURL(
        currentBlobUrlRef.current
      );

      currentBlobUrlRef.current = null;
    }

    if (nextImageUrl?.startsWith('blob:')) {
      currentBlobUrlRef.current =
        nextImageUrl;
    }

    setImagePreviewUrl(nextImageUrl);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [entries, selectedKey]);

  /* ---------------------------------------------------------
   * COMPONENT CLEANUP
   * --------------------------------------------------------- */

  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }

      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(
          currentBlobUrlRef.current
        );
      }
    };
  }, []);

  /* ---------------------------------------------------------
   * CALENDAR NAVIGATION
   * --------------------------------------------------------- */

  function handlePreviousWeek() {
    setCurrentMonday((previousMonday) =>
      addDays(previousMonday, -7)
    );

    setSelectedDate((previousSelectedDate) =>
      addDays(previousSelectedDate, -7)
    );

    setApiError('');
  }

  function handleNextWeek() {
    setCurrentMonday((previousMonday) =>
      addDays(previousMonday, 7)
    );

    setSelectedDate((previousSelectedDate) =>
      addDays(previousSelectedDate, 7)
    );

    setApiError('');
  }

  function handleGoToToday() {
    setCurrentMonday(
      getMondayOfWeek(todayDate)
    );

    setSelectedDate(new Date(todayDate));
    setApiError('');
  }

  function handleDateSelection(date) {
    setSelectedDate(new Date(date));
    setApiError('');
  }

  /* ---------------------------------------------------------
   * IMAGE SELECTION
   * --------------------------------------------------------- */

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    setFileError('');

    if (!file) {
      return;
    }

    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!validTypes.includes(file.type)) {
      setFileError(
        'Please choose a JPEG, PNG, or WebP image.'
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      return;
    }

    const maximumBytes = 5 * 1024 * 1024;

    if (file.size > maximumBytes) {
      setFileError(
        'Image exceeds 5 MB. Please choose a smaller file.'
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      return;
    }

    if (currentBlobUrlRef.current) {
      URL.revokeObjectURL(
        currentBlobUrlRef.current
      );
    }

    const previewUrl =
      URL.createObjectURL(file);

    currentBlobUrlRef.current = previewUrl;

    setImageFile(file);
    setImagePreviewUrl(previewUrl);
  }

  function handleRemoveImage() {
    if (currentBlobUrlRef.current) {
      URL.revokeObjectURL(
        currentBlobUrlRef.current
      );

      currentBlobUrlRef.current = null;
    }

    setImageFile(null);
    setImagePreviewUrl(null);
    setFileError('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  /* ---------------------------------------------------------
   * SAVE OR UPDATE SELECTED DATE
   * --------------------------------------------------------- */

  async function handleSaveMood(event) {
  event.preventDefault();

  const trimmedMood = moodText.trim();

  if (!trimmedMood || isSavingMood) {
    return;
  }

  try {
    setIsSavingMood(true);
    setApiError('');
    setSaveSuccessMessage('');

    let imageKey =
      activeEntryForSelected?.imageKey || null;

    /*
     * If the user selected a new local image,
     * upload it to S3 first.
     */
    if (imageFile) {
      const uploadData =
        await requestImageUpload(
          selectedKey,
          imageFile
        );

      if (
        !uploadData?.uploadUrl ||
        !uploadData?.imageKey
      ) {
        throw new Error(
          'The backend did not return image upload information.'
        );
      }

      await uploadImageToS3(
        uploadData.uploadUrl,
        imageFile
      );

      imageKey = uploadData.imageKey;
    }

    /*
     * Once the optional S3 upload succeeds,
     * save text + imageKey to DynamoDB.
     */
    const data = await saveMood(
      trimmedMood,
      selectedKey,
      imageKey
    );

    if (!data?.item?.moodDate) {
      throw new Error(
        'The API response did not contain a saved mood.'
      );
    }

    const savedItem = data.item;

    setEntries((previousEntries) => ({
      ...previousEntries,

      [savedItem.moodDate]: {
        moodDate: savedItem.moodDate,
        mood:
          savedItem.mood || trimmedMood,
        imageKey:
          savedItem.imageKey || imageKey,
        imageUrl: imagePreviewUrl,
        updatedAt:
          savedItem.updatedAt || null,
      },
    }));

    setSaveSuccessMessage(
      `Mood for ${selectedDate.toLocaleDateString(
        undefined,
        {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }
      )} has been saved.`
    );

    if (successTimerRef.current) {
      clearTimeout(
        successTimerRef.current
      );
    }

    successTimerRef.current =
      setTimeout(() => {
        setSaveSuccessMessage('');
      }, 4000);
  } catch (error) {
    console.error(
      'Failed to save mood:',
      error
    );

    setApiError(
      error instanceof Error
        ? error.message
        : 'Unable to save your mood. Please try again.'
    );
  } finally {
    setIsSavingMood(false);
  }
}

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600">
              <BookOpen className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                  Mood Yourself
                </span>

                <span className="inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700">
                  Journal
                </span>
              </div>

              <p className="text-xs text-slate-500">
                {userEmail ||
                  'Private daily reflections'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
            aria-label="Sign out of your account"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <section className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Hello, {userName}
          </h1>

          <p className="text-sm text-slate-500">
            Select any date to create or update
            your reflection.
          </p>
        </section>

        {apiError && (
          <div
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {apiError}
          </div>
        )}

        <section
          aria-label="Week navigation"
          className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-indigo-600" />

              <h2 className="text-sm font-medium text-slate-800 sm:text-base">
                {formatWeekRange(
                  weekDays[0],
                  weekEndDay
                )}
              </h2>

              {isLoadingMoods && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  Loading
                </span>
              )}
            </div>

            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePreviousWeek}
                className="rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Previous week"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleGoToToday}
                disabled={
                  isCurrentWeekDisplayed &&
                  selectedKey === todayKey
                }
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isCurrentWeekDisplayed &&
                  selectedKey === todayKey
                    ? 'cursor-not-allowed bg-slate-50 text-slate-400'
                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                }`}
              >
                Today
              </button>

              <button
                type="button"
                onClick={handleNextWeek}
                className="rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Next week"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {weekDays.map((date) => {
              const dateKey =
                getLocalDateKey(date);

              const status = getDayStatus(
                date,
                todayKey
              );

              const isSelected =
                dateKey === selectedKey;

              const hasEntry = Boolean(
                entries[dateKey]?.mood
              );

              const weekdayName =
                date.toLocaleDateString(
                  undefined,
                  {
                    weekday: 'narrow',
                  }
                );

              let containerClasses =
                'flex flex-col items-center justify-between rounded-2xl border p-2 text-center transition-all sm:p-2.5 ';

              if (isSelected) {
                containerClasses +=
                  'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20 ';
              } else if (status === 'TODAY') {
                containerClasses +=
                  'border-indigo-300 bg-indigo-50/30 hover:border-indigo-400 ';
              } else if (status === 'PAST') {
                containerClasses +=
                  'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/20 ';
              } else {
                containerClasses +=
                  'border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/20 ';
              }

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() =>
                    handleDateSelection(date)
                  }
                  className={containerClasses}
                  aria-label={`${date.toLocaleDateString(
                    undefined,
                    {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    }
                  )}, ${status.toLowerCase()}${
                    hasEntry
                      ? ', reflection saved'
                      : ', no reflection saved'
                  }`}
                >
                  <span className="text-[11px] font-medium text-slate-500">
                    {weekdayName}
                  </span>

                  <span
                    className={`my-0.5 text-sm font-semibold sm:text-base ${
                      status === 'TODAY'
                        ? 'font-bold text-indigo-600'
                        : isSelected
                          ? 'text-slate-900'
                          : 'text-slate-700'
                    }`}
                  >
                    {date.getDate()}
                  </span>

                  <span className="flex h-1.5 w-1.5 items-center justify-center rounded-full">
                    {hasEntry ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    ) : status === 'TODAY' ? (
                      <span className="h-1 w-1 rounded-full bg-indigo-300" />
                    ) : (
                      <span className="h-1.5 w-1.5" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section aria-label="Selected date editor">
          <div className="space-y-6 rounded-3xl border-2 border-indigo-200/80 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                    {getDateStatusLabel(
                      selectedStatus
                    )}
                  </span>

                  <span className="text-sm font-medium text-slate-600">
                    {selectedDate.toLocaleDateString(
                      undefined,
                      {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      }
                    )}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                  {activeEntryForSelected?.mood
                    ? 'Update this mood'
                    : 'Add a mood for this date'}
                </h2>
              </div>

              <div className="flex items-center gap-1.5 rounded-xl bg-indigo-50 px-2.5 py-1 text-xs text-indigo-600">
                <Sparkles className="h-3.5 w-3.5" />
                <span>
                  Every selected date is editable.
                </span>
              </div>
            </div>

            <form
              onSubmit={handleSaveMood}
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <label
                  htmlFor="selected-mood-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Your reflection
                </label>

                <textarea
                  id="selected-mood-input"
                  rows={4}
                  maxLength={200}
                  value={moodText}
                  onChange={(event) =>
                    setMoodText(
                      event.target.value
                    )
                  }
                  placeholder="Write your mood or reflection for this date..."
                  className="w-full resize-none rounded-2xl border border-slate-200 p-3.5 text-sm leading-relaxed text-slate-900 transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />

                <div className="flex justify-end">
                  <span
                    className={`text-xs ${
                      moodText.length >= 200
                        ? 'font-medium text-amber-600'
                        : 'text-slate-400'
                    }`}
                    aria-live="polite"
                  >
                    {moodText.length} / 200
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Add an image for this date
                </label>

                {imagePreviewUrl ? (
                  <div className="relative flex flex-col items-center gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:flex-row">
                    <div className="h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-200">
                      <img
                        src={imagePreviewUrl}
                        alt={`Mood preview for ${selectedDate.toLocaleDateString()}`}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
                      <p className="truncate text-xs font-medium text-slate-700">
                        {imageFile
                          ? imageFile.name
                          : 'Saved mood photo'}
                      </p>

                      <p className="text-[11px] text-slate-500">
                        Image preview is currently
                        stored only in your browser.
                        S3 persistence will be added
                        next.
                      </p>

                      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 sm:justify-start">
                        <button
                          type="button"
                          onClick={() =>
                            fileInputRef.current?.click()
                          }
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          Change Image
                        </button>

                        <button
                          type="button"
                          onClick={
                            handleRemoveImage
                          }
                          className="inline-flex items-center gap-1 rounded-xl border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100/70 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        >
                          <X className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="mood-image-file"
                    className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-5 text-center transition-all hover:border-indigo-400 hover:bg-indigo-50/20"
                  >
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors group-hover:border-indigo-200 group-hover:text-indigo-600">
                      <ImageIcon className="h-5 w-5" />
                    </div>

                    <span className="text-xs font-medium text-slate-700">
                      Click to select an image
                    </span>

                    <span className="mt-0.5 text-[11px] text-slate-400">
                      JPEG, PNG, or WebP up to 5 MB
                    </span>
                  </label>
                )}

                <input
                  ref={fileInputRef}
                  id="mood-image-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="sr-only"
                />

                {fileError && (
                  <p
                    className="text-xs font-medium text-rose-600"
                    role="alert"
                  >
                    {fileError}
                  </p>
                )}
              </div>

              <div
                aria-live="polite"
                className="min-h-[20px]"
              >
                {saveSuccessMessage && (
                  <div className="flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>
                      {saveSuccessMessage}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end border-t border-slate-100 pt-2">
                <button
                  type="submit"
                  disabled={
                    !moodText.trim() ||
                    isSavingMood
                  }
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    !moodText.trim() ||
                    isSavingMood
                      ? 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                      : 'bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-700 active:scale-[0.99]'
                  }`}
                >
                  {isSavingMood ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}

                  <span>
                    {isSavingMood
                      ? 'Saving...'
                      : activeEntryForSelected?.mood
                        ? 'Update Mood'
                        : 'Save Mood'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

export default MoodInputScreen;