export type LinkErrors = {
  title?: string;
  url?: string;
};

export function validateLink(title: string, url: string): LinkErrors {
  const errors: LinkErrors = {};

  if (!title.trim()) {
    errors.title = "링크 제목을 입력해 주세요.";
  }

  try {
    const parsedUrl = new URL(url.trim());
    if (
      !/^https?:\/\//i.test(url.trim()) ||
      (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:")
    ) {
      errors.url = "http:// 또는 https://로 시작하는 올바른 URL을 입력해 주세요.";
    }
  } catch {
    errors.url = "http:// 또는 https://로 시작하는 올바른 URL을 입력해 주세요.";
  }

  return errors;
}
