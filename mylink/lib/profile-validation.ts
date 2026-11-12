export type ProfileErrors = {
  username?: string;
  form?: string;
};

export function validateUsername(username: string): string | undefined {
  if (!/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(username.trim())) {
    return "사용자 이름은 소문자 영문·숫자·하이픈 3~30자로 입력하고, 처음과 끝에는 영문 또는 숫자를 사용해 주세요.";
  }
}

export function getProfileSaveError(error: unknown): ProfileErrors {
  const databaseError = error as {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
  } | null;
  const details = [databaseError?.message, databaseError?.details, databaseError?.hint]
    .filter((value) => typeof value === "string")
    .join(" ");

  if (databaseError?.code === "23505") {
    if (/user_id|pkey/i.test(details) && !/username/i.test(details)) {
      return { form: "프로필이 이미 생성되었습니다. 다시 저장해 주세요." };
    }
    return { username: "이미 사용 중인 사용자 이름입니다. 다른 이름을 입력해 주세요." };
  }

  if (
    /reserved|예약/i.test(details) ||
    (databaseError?.code === "23514" && /username/i.test(details))
  ) {
    return { username: "예약어이거나 사용할 수 없는 사용자 이름입니다. 다른 이름을 입력해 주세요." };
  }

  return {
    form: "프로필을 저장하지 못했습니다. 로그인 상태와 네트워크 연결을 확인한 뒤 다시 시도해 주세요.",
  };
}
