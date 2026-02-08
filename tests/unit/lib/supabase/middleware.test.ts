import { describe, it, expect } from 'vitest';
import { checkIsPublicPath } from '@/lib/supabase/middleware';

describe('checkIsPublicPath', () => {
  it('トップページは公開パス', () => {
    expect(checkIsPublicPath('/')).toBe(true);
  });

  it('ログインページは公開パス', () => {
    expect(checkIsPublicPath('/login')).toBe(true);
  });

  it('イベント一覧は公開パス', () => {
    expect(checkIsPublicPath('/events')).toBe(true);
  });

  it('イベント詳細は公開パス', () => {
    expect(checkIsPublicPath('/events/some-uuid')).toBe(true);
  });

  it('/events/new は認証必須', () => {
    expect(checkIsPublicPath('/events/new')).toBe(false);
  });

  it('/events/[id]/edit は認証必須', () => {
    expect(checkIsPublicPath('/events/some-uuid/edit')).toBe(false);
  });

  it('ダッシュボードは認証必須', () => {
    expect(checkIsPublicPath('/dashboard')).toBe(false);
  });

  it('マイページは認証必須', () => {
    expect(checkIsPublicPath('/my-page')).toBe(false);
  });

  it('プロフィール設定は認証必須', () => {
    expect(checkIsPublicPath('/profile/setup')).toBe(false);
  });
});
