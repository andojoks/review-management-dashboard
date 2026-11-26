import { HttpResponse, delay, http } from 'msw';
import { appConfig } from '@/data/config';
import { sourceNow } from '@/ui/data/clock';
import type {
  ApiMethod, DocumentUpload, MessageInput, Notice, ProInvite,
  ReviewPatch, SettingsPatch, ThreadPatch,
} from '@/types';
import { getDb, mutateDb, resetDb, setDb } from './db';

const isRecord = /[?&]record\b/.test(window.location.search);
const pause = () => (isRecord ? Promise.resolve() : delay(45));

function missing(name: string) {
  return HttpResponse.json({ message: `${name} not found`, code: 'NOT_FOUND' }, { status: 404 });
}

function body<T>(value: unknown): T {
  return value as T;
}

const reviewPatch = (target: NonNullable<ReturnType<typeof getDb>['reviews'][number]>, patch: ReviewPatch) => {
  if (patch.title !== undefined) target.title = patch.title;
  if (patch.text !== undefined) target.text = patch.text;
  if (patch.status !== undefined) target.status = patch.status as typeof target.status;
  if (patch.flag !== undefined) target.flag = patch.flag ?? undefined;
  if (patch.helpful !== undefined) target.helpful += patch.helpful;
  if (patch.reply) {
    target.reply = {
      by: patch.reply.by ?? 'odile',
      text: patch.reply.text,
      t: sourceNow(),
    };
    target.status = 'replied';
  }
};

export const handlers = [
  http.get('/api/bootstrap', async () => {
    await pause();
    return HttpResponse.json(getDb());
  }),

  http.get('/api/config', async () => {
    await pause();
    return HttpResponse.json(appConfig);
  }),

  http.get('/api/state', async () => {
    await pause();
    return HttpResponse.json(getDb());
  }),

  http.post('/api/state/restore', async ({ request }) => {
    await pause();
    const { state } = body<{ state: ReturnType<typeof getDb> }>(await request.json());
    setDb(state);
    return HttpResponse.json({ ok: true });
  }),

  http.get('/api/reviews', async () => {
    await pause();
    return HttpResponse.json(getDb().reviews);
  }),

  http.post('/api/reviews', async ({ request }) => {
    await pause();
    const review = body<ReturnType<typeof getDb>['reviews'][number]>(await request.json());
    const { before } = mutateDb((draft) => { draft.reviews.unshift(review); });
    return HttpResponse.json({ data: review, before });
  }),

  http.patch('/api/reviews/:id', async ({ params, request }) => {
    await pause();
    const patch = body<ReviewPatch>(await request.json());
    const { result, before } = mutateDb((draft) => {
      const review = draft.reviews.find((item) => item.id === params.id);
      if (!review) return null;
      reviewPatch(review, patch);
      return review;
    });
    if (!result) return missing('Review');
    return HttpResponse.json({ data: result, before });
  }),

  http.get('/api/pros', async () => {
    await pause();
    return HttpResponse.json(getDb().pros);
  }),

  http.post('/api/pros', async ({ request }) => {
    await pause();
    const pro = body<ReturnType<typeof getDb>['pros'][number]>(await request.json());
    const { before } = mutateDb((draft) => { draft.pros.push(pro); });
    return HttpResponse.json({ data: pro, before });
  }),

  http.post('/api/pros/:id/advance', async ({ params }) => {
    await pause();
    const { result, before } = mutateDb((draft) => {
      const pro = draft.pros.find((item) => item.id === params.id);
      if (!pro || pro.status !== 'onboarding') return null;
      const nextStep = pro.step + 1;
      const live = nextStep >= 4;
      pro.step = nextStep;
      if (live) pro.status = 'live';
      const firstPending = draft.verifications.find(
        (item) => item.pro === pro.id && item.status === 'pending',
      );
      if (firstPending) firstPending.status = 'approved';
      return {
        message: live
          ? `${pro.name} is live on Handwell`
          : `${pro.name} → ${appConfig.pros.progressSteps[nextStep]}`,
      };
    });
    if (!result) return missing('Pro');
    return HttpResponse.json({ data: result, before });
  }),

  http.post('/api/pros/:id/toggle', async ({ params }) => {
    await pause();
    const { result, before } = mutateDb((draft) => {
      const pro = draft.pros.find((item) => item.id === params.id);
      if (!pro || pro.status === 'onboarding') return null;
      pro.status = pro.status === 'paused' ? 'live' : 'paused';
      return {
        message: pro.status === 'paused'
          ? `${pro.name} paused — no new bookings`
          : `${pro.name} is taking bookings again`,
      };
    });
    if (!result) return missing('Pro');
    return HttpResponse.json({ data: result, before });
  }),

  http.post('/api/verifications/:id/decide', async ({ params, request }) => {
    await pause();
    const { approved } = body<{ approved: boolean }>(await request.json());
    const state = getDb();
    const verification = state.verifications.find((item) => item.id === params.id);
    if (!verification) return missing('Verification');
    const pro = state.pros.find((item) => item.id === verification.pro);
    const firstPending = state.verifications.find(
      (item) => item.pro === verification.pro && item.status === 'pending',
    );
    if (approved && pro?.status === 'onboarding' && firstPending?.id === verification.id) {
      const { result, before } = mutateDb((draft) => {
        const targetPro = draft.pros.find((item) => item.id === verification.pro);
        if (!targetPro) return null;
        const nextStep = targetPro.step + 1;
        const live = nextStep >= 4;
        targetPro.step = nextStep;
        if (live) targetPro.status = 'live';
        const pending = draft.verifications.find(
          (item) => item.pro === targetPro.id && item.status === 'pending',
        );
        if (pending) pending.status = 'approved';
        return {
          message: live
            ? `${targetPro.name} is live on Handwell`
            : `${targetPro.name} → ${appConfig.pros.progressSteps[nextStep]}`,
        };
      });
      if (!result) return missing('Pro');
      return HttpResponse.json({ data: result, before });
    }

    const { result, before } = mutateDb((draft) => {
      const target = draft.verifications.find((item) => item.id === params.id);
      if (!target) return null;
      target.status = approved ? 'approved' : 'rejected';
      return {
        message: `${target.kind} for ${pro?.name ?? 'the pro'} ${approved ? 'approved' : 'sent back'}`,
        warn: !approved,
      };
    });
    if (!result) return missing('Verification');
    return HttpResponse.json({ data: result, before });
  }),

  http.get('/api/documents', async () => {
    await pause();
    const { docs, verifications } = getDb();
    return HttpResponse.json({ docs, verifications });
  }),

  http.delete('/api/documents/:id', async ({ params }) => {
    await pause();
    const { before } = mutateDb((draft) => {
      draft.docs = draft.docs.filter((item) => item.id !== params.id);
    });
    return HttpResponse.json({ ok: true, before });
  }),

  http.post('/api/documents/:id/star', async ({ params }) => {
    await pause();
    const { result, before } = mutateDb((draft) => {
      const doc = draft.docs.find((item) => item.id === params.id);
      if (!doc) return null;
      doc.starred = !doc.starred;
      return doc;
    });
    if (!result) return missing('Document');
    return HttpResponse.json({ data: result, before });
  }),

  http.post('/api/documents/upload', async ({ request }) => {
    await pause();
    const input = body<DocumentUpload>(await request.json());
    const doc = {
      id: `d${Date.now()}`,
      name: input.name,
      kind: input.kind as ReturnType<typeof getDb>['docs'][number]['kind'],
      folder: input.folder,
      size: input.size,
      updated: sourceNow(),
      owner: input.owner,
      starred: false,
    };
    const { before } = mutateDb((draft) => { draft.docs.unshift(doc); });
    return HttpResponse.json({ data: doc, before });
  }),

  http.get('/api/threads', async () => {
    await pause();
    return HttpResponse.json(getDb().threads);
  }),

  http.patch('/api/threads/:id', async ({ params, request }) => {
    await pause();
    const patch = body<ThreadPatch>(await request.json());
    const { result, before } = mutateDb((draft) => {
      const thread = draft.threads.find((item) => item.id === params.id);
      if (!thread) return null;
      if (patch.subject !== undefined) thread.subject = patch.subject;
      if (patch.unread !== undefined) thread.unread = patch.unread;
      if (patch.archived !== undefined) thread.archived = patch.archived;
      if (patch.read) thread.unread = 0;
      return thread;
    });
    if (!result) return missing('Thread');
    return HttpResponse.json({ data: result, before });
  }),

  http.post('/api/threads/:id/messages', async ({ params, request }) => {
    await pause();
    const input = body<MessageInput>(await request.json());
    const { result, before } = mutateDb((draft) => {
      const thread = draft.threads.find((item) => item.id === params.id);
      if (!thread) return null;
      thread.msgs.push({ from: input.from ?? 'me', text: input.text, t: sourceNow(), by: input.by });
      thread.unread = 0;
      return thread;
    });
    if (!result) return missing('Thread');
    return HttpResponse.json({ data: result, before });
  }),

  http.post('/api/threads', async ({ request }) => {
    await pause();
    const thread = body<ReturnType<typeof getDb>['threads'][number]>(await request.json());
    const { before } = mutateDb((draft) => { draft.threads.unshift(thread); });
    return HttpResponse.json({ data: thread, before });
  }),

  http.patch('/api/session', async ({ request }) => {
    await pause();
    const { signedIn } = body<{ signedIn: boolean }>(await request.json());
    mutateDb((draft) => { draft.signedIn = signedIn; });
    return HttpResponse.json({ ok: true });
  }),

  http.get('/api/settings', async () => {
    await pause();
    const { me, team, prefs } = getDb();
    return HttpResponse.json({ me, team, prefs });
  }),

  http.patch('/api/settings', async ({ request }) => {
    await pause();
    const patch = body<SettingsPatch>(await request.json());
    const { result, before } = mutateDb((draft) => {
      if (patch.name !== undefined) draft.me.name = patch.name;
      if (patch.email !== undefined) draft.me.email = patch.email;
      if (patch.signature !== undefined) draft.prefs.signature = patch.signature;
      if (patch.teamName !== undefined && draft.team[0]) draft.team[0].name = patch.teamName;
      if (patch.prefs) Object.assign(draft.prefs, patch.prefs);
      return { me: draft.me, team: draft.team, prefs: draft.prefs };
    });
    return HttpResponse.json({ data: result, before });
  }),

  http.post('/api/settings/pros', async ({ request }) => {
    await pause();
    const input = body<ProInvite>(await request.json());
    const state = getDb();
    const pro = {
      id: `p${state.pros.length + 1}`,
      name: input.name,
      trade: input.trade as ReturnType<typeof getDb>['pros'][number]['trade'],
      city: input.city,
      hue: state.pros.length % 6,
      joined: sourceNow(),
      jobs: 0,
      status: 'onboarding' as const,
      step: 0,
      responseRate: input.responseRate ?? 1,
      phone: input.phone ?? input.email,
      bio: input.bio ?? 'New to Handwell.',
    };
    const kinds = appConfig.modals.verificationKinds;
    const { result, before } = mutateDb((draft) => {
      draft.pros.push(pro);
      kinds.forEach((kind, index) => {
        draft.verifications.unshift({
          id: `v${Date.now()}-${index}`,
          pro: pro.id,
          kind,
          sent: sourceNow(),
          expires: sourceNow() + (input.expiresDays ?? 14) * 86_400_000,
          status: 'pending',
          file: `${input.filePrefix ? `${input.filePrefix}-` : ''}${kind.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        });
      });
      return pro;
    });
    return HttpResponse.json({ data: result, before });
  }),

  http.post('/api/settings/team', async ({ request }) => {
    await pause();
    const member = body<ReturnType<typeof getDb>['team'][number]>(await request.json());
    const { before } = mutateDb((draft) => { draft.team.push(member); });
    return HttpResponse.json({ data: member, before });
  }),

  http.get('/api/notices', async () => {
    await pause();
    return HttpResponse.json(getDb().notices);
  }),

  http.post('/api/notices', async ({ request }) => {
    await pause();
    const notice = body<Notice>(await request.json());
    const { before } = mutateDb((draft) => { draft.notices.unshift(notice); });
    return HttpResponse.json({ data: notice, before });
  }),

  http.patch('/api/notices/:id', async ({ params, request }) => {
    await pause();
    const patch = body<Partial<Notice>>(await request.json());
    const { result, before } = mutateDb((draft) => {
      const notice = draft.notices.find((item) => item.id === params.id);
      if (!notice) return null;
      Object.assign(notice, patch);
      return notice;
    });
    if (!result) return missing('Notice');
    return HttpResponse.json({ data: result, before });
  }),

  http.post('/api/demo/reset', async () => {
    await pause();
    resetDb();
    return HttpResponse.json({ ok: true });
  }),
];

export const apiMethods: ApiMethod[] = ['GET', 'POST', 'PATCH', 'DELETE'];
