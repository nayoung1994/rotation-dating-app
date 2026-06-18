import { useMemo, useState } from "react"
import {
  Bell,
  CalendarCheck,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  Heart,
  HeartHandshake,
  LockKeyhole,
  MessageSquareText,
  Pause,
  Play,
  QrCode,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TimerReset,
  UserCheck,
  UserRound,
  UsersRound,
} from "lucide-react"

type Role = "host" | "guest"
type HostTab = "dashboard" | "rotation" | "matches"
type GuestTab = "ticket" | "round" | "choice"
type GuestStatus = "checked" | "waiting" | "late"

type Guest = {
  id: string
  name: string
  age: number
  seat: string
  group: "A" | "B"
  interests: string[]
  status: GuestStatus
  notes: string
}

type Pair = {
  table: number
  left: string
  right: string
  signal: "ready" | "needs" | "done"
}

const guests: Guest[] = [
  {
    id: "g01",
    name: "김서윤",
    age: 31,
    seat: "A1",
    group: "A",
    interests: ["러닝", "와인", "전시"],
    status: "checked",
    notes: "조용한 테이블 선호",
  },
  {
    id: "g02",
    name: "박민재",
    age: 33,
    seat: "B1",
    group: "B",
    interests: ["등산", "재즈", "커피"],
    status: "checked",
    notes: "첫 라운드 안내 완료",
  },
  {
    id: "g03",
    name: "이하린",
    age: 29,
    seat: "A2",
    group: "A",
    interests: ["책", "필라테스", "영화"],
    status: "waiting",
    notes: "도착 문자 발송",
  },
  {
    id: "g04",
    name: "정우진",
    age: 32,
    seat: "B2",
    group: "B",
    interests: ["요리", "여행", "사진"],
    status: "checked",
    notes: "알레르기 없음",
  },
  {
    id: "g05",
    name: "최나은",
    age: 30,
    seat: "A3",
    group: "A",
    interests: ["클라이밍", "디자인", "공연"],
    status: "checked",
    notes: "매칭 카드 수령",
  },
  {
    id: "g06",
    name: "윤태오",
    age: 34,
    seat: "B3",
    group: "B",
    interests: ["수영", "브런치", "건축"],
    status: "late",
    notes: "10분 지연 예정",
  },
]

const pairs: Pair[] = [
  { table: 1, left: "김서윤", right: "박민재", signal: "ready" },
  { table: 2, left: "이하린", right: "정우진", signal: "needs" },
  { table: 3, left: "최나은", right: "윤태오", signal: "done" },
]

const matchResults = [
  ["김서윤", "박민재", "상호 선택", "연락처 공개 예정"],
  ["최나은", "정우진", "호감 선택", "호스트 확인 필요"],
  ["이하린", "윤태오", "대기", "라운드 3 이후 집계"],
]

const guestChoices = [
  ["박민재", "B1", "커피와 전시 이야기가 잘 맞았어요"],
  ["정우진", "B2", "대화 속도가 편안했어요"],
  ["윤태오", "B3", "다음 라운드 후 다시 선택 가능"],
]

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [role, setRole] = useState<Role | null>(null)
  const [hostTab, setHostTab] = useState<HostTab>("dashboard")
  const [guestTab, setGuestTab] = useState<GuestTab>("ticket")
  const [round, setRound] = useState(2)
  const [isRunning, setIsRunning] = useState(true)

  const checkedCount = useMemo(() => guests.filter((guest) => guest.status === "checked").length, [])
  const waitingCount = guests.length - checkedCount
  const currentPair = pairs.find((pair) => pair.signal === "needs") ?? pairs[0]

  return (
    <main className="shell">
      <section className="workspace">
        <section className="phone-wrap">
          <div className="phone">
            <div className="phone-status">
              <span>9:41</span>
              <span>{role === "guest" ? "GUEST" : role === "host" ? "HOST" : "ROUND"}</span>
            </div>
            <div className="phone-app">
              {!isLoggedIn && <LoginScreen onLogin={() => setIsLoggedIn(true)} />}

              {isLoggedIn && role === null && <RoleScreen setRole={setRole} />}

              {isLoggedIn && role === "host" && (
                <>
                  <AppHeader
                    eyebrow={`ROUND ${round}`}
                    title={hostTab === "dashboard" ? "운영 현황" : hostTab === "rotation" ? "자리 이동" : "매칭 결과"}
                    onRoleReset={() => setRole(null)}
                    roleLabel="호스트"
                  />
                  <div className="screen">
                    {hostTab === "dashboard" && (
                      <DashboardScreen
                        checkedCount={checkedCount}
                        currentPair={currentPair}
                        isRunning={isRunning}
                        round={round}
                        setIsRunning={setIsRunning}
                        waitingCount={waitingCount}
                      />
                    )}
                    {hostTab === "rotation" && <RotationScreen pairs={pairs} round={round} setRound={setRound} />}
                    {hostTab === "matches" && <MatchesScreen />}
                  </div>
                  <HostBottomBar tab={hostTab} setTab={setHostTab} />
                </>
              )}

              {isLoggedIn && role === "guest" && (
                <>
                  <AppHeader
                    eyebrow="성수 커피챗"
                    title={guestTab === "ticket" ? "내 참가권" : guestTab === "round" ? "현재 라운드" : "호감 선택"}
                    onRoleReset={() => setRole(null)}
                    roleLabel="참가자"
                  />
                  <div className="screen">
                    {guestTab === "ticket" && <GuestTicketScreen />}
                    {guestTab === "round" && <GuestRoundScreen />}
                    {guestTab === "choice" && <GuestChoiceScreen />}
                  </div>
                  <GuestBottomBar tab={guestTab} setTab={setGuestTab} />
                </>
              )}
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const canLogin = email.trim().length > 0 && password.trim().length > 0

  return (
    <div className="auth-screen">
      <div className="login-mark">
        <HeartHandshake size={28} />
      </div>
      <div>
        <p className="eyebrow">ROTATION DATING</p>
        <h1>Round Host</h1>
        <p>로그인 후 호스트와 참가자 화면을 선택해 이용합니다.</p>
      </div>

      <div className="login-form">
        <label>
          아이디
          <input
            onChange={(event) => setEmail(event.target.value)}
            placeholder="아이디를 입력하세요"
            type="email"
            value={email}
          />
        </label>
        <label>
          비밀번호
          <input
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호를 입력하세요"
            type="password"
            value={password}
          />
        </label>
      </div>

      <button className="ds-button primary-action" disabled={!canLogin} onClick={onLogin}>
        <LockKeyhole size={18} />
        로그인
      </button>
    </div>
  )
}

function RoleScreen({ setRole }: { setRole: (role: Role) => void }) {
  return (
    <div className="role-screen">
      <div>
        <p className="eyebrow">SELECT MODE</p>
        <h2>어떤 화면으로 시작할까요?</h2>
        <p>같은 행사 데이터를 기준으로 호스트 운영과 참가자 경험을 나누어 확인할 수 있습니다.</p>
      </div>

      <div className="role-list">
        <button className="role-card-button" onClick={() => setRole("host")}>
          <span>
            <UsersRound size={24} />
          </span>
          <strong>호스트용</strong>
          <small>체크인, 라운드 이동, 매칭 결과를 운영합니다.</small>
        </button>
        <button className="role-card-button" onClick={() => setRole("guest")}>
          <span>
            <UserRound size={24} />
          </span>
          <strong>사용자용</strong>
          <small>참가권 확인, 자리 안내, 호감 선택을 진행합니다.</small>
        </button>
      </div>
    </div>
  )
}

function AppHeader({
  eyebrow,
  onRoleReset,
  roleLabel,
  title,
}: {
  eyebrow: string
  onRoleReset: () => void
  roleLabel: string
  title: string
}) {
  return (
    <div className="app-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <button className="ds-icon-button qr-button" aria-label={`${roleLabel} 전환`} onClick={onRoleReset}>
        <QrCode size={18} />
      </button>
    </div>
  )
}

function DashboardScreen({
  checkedCount,
  currentPair,
  isRunning,
  round,
  setIsRunning,
  waitingCount,
}: {
  checkedCount: number
  currentPair: Pair
  isRunning: boolean
  round: number
  setIsRunning: (value: boolean) => void
  waitingCount: number
}) {
  return (
    <div className="screen-stack">
      <section className="timer-card">
        <div className="timer-top">
          <span>
            <Clock3 size={16} />
            라운드 {round} 진행 중
          </span>
          <button className="ds-icon-button inverse" onClick={() => setIsRunning(!isRunning)}>
            {isRunning ? <Pause size={17} /> : <Play size={17} />}
          </button>
        </div>
        <strong>06:42</strong>
        <div className="progress">
          <span />
        </div>
        <p>A그룹은 종료 후 다음 번호 테이블로 이동합니다.</p>
      </section>

      <div className="metric-grid">
        <Metric icon={UserCheck} label="체크인" value={`${checkedCount}명`} />
        <Metric icon={CircleAlert} label="대기" value={`${waitingCount}명`} />
        <Metric icon={MessageSquareText} label="문의" value="2건" />
      </div>

      <section className="attention-card">
        <div>
          <p className="eyebrow">NEEDS HOST</p>
          <h3>테이블 {currentPair.table} 확인</h3>
          <span>
            {currentPair.left} · {currentPair.right}
          </span>
        </div>
        <button className="ds-button compact">
          보기
          <ChevronRight size={16} />
        </button>
      </section>

      <section className="panel-lite">
        <div className="panel-head">
          <h3>빠른 실행</h3>
        </div>
        <div className="quick-grid">
          <button className="quick-action-button">
            <Bell size={17} />
            종료 알림
          </button>
          <button className="quick-action-button">
            <TimerReset size={17} />
            2분 추가
          </button>
          <button className="quick-action-button">
            <ShieldCheck size={17} />
            안전 호출
          </button>
        </div>
      </section>
    </div>
  )
}

function RotationScreen({ pairs, round, setRound }: { pairs: Pair[]; round: number; setRound: (value: number) => void }) {
  return (
    <div className="screen-stack">
      <section className="move-card">
        <p className="eyebrow">NEXT MOVE</p>
        <h3>라운드 {round + 1} 배치 미리보기</h3>
        <p>A그룹은 +1 테이블로 이동하고 B그룹은 현재 자리를 유지합니다.</p>
        <button className="ds-button primary-action" onClick={() => setRound(round + 1)}>
          <RotateCcw size={17} />
          다음 라운드 시작
        </button>
      </section>

      <div className="pair-list">
        {pairs.map((pair) => (
          <article className="pair-card" key={pair.table}>
            <div className="table-number">T{pair.table}</div>
            <div>
              <div className="pair-names">
                <strong>{pair.left}</strong>
                <span />
                <strong>{pair.right}</strong>
              </div>
              <p>{pair.signal === "ready" ? "준비 완료" : pair.signal === "needs" ? "호스트 확인 필요" : "대화 종료 기록됨"}</p>
            </div>
            <StatusDot status={pair.signal === "needs" ? "late" : "checked"} />
          </article>
        ))}
      </div>
    </div>
  )
}

function MatchesScreen() {
  return (
    <div className="screen-stack">
      <section className="match-hero">
        <p className="eyebrow">AFTER PARTY</p>
        <h3>상호 선택 1쌍</h3>
        <p>호스트 확인 후 양쪽에게 연락처 공개 알림을 보낼 수 있습니다.</p>
      </section>

      <div className="result-list">
        {matchResults.map(([left, right, status, action]) => (
          <article className="result-card" key={`${left}-${right}`}>
            <div className="result-pair">
              <strong>{left}</strong>
              <HeartHandshake size={17} />
              <strong>{right}</strong>
            </div>
            <p>{action}</p>
            <span>{status}</span>
          </article>
        ))}
      </div>
    </div>
  )
}

function GuestTicketScreen() {
  return (
    <div className="screen-stack">
      <section className="ticket-card">
        <p className="eyebrow">CHECK-IN READY</p>
        <h3>김서윤 님</h3>
        <strong>A1</strong>
        <p>입장 시 QR을 보여주면 호스트가 체크인을 완료합니다.</p>
      </section>

      <div className="info-list">
        <InfoRow icon={CalendarCheck} title="행사 시간" copy="오늘 18:30 · 성수 라운지 3F" />
        <InfoRow icon={UsersRound} title="진행 방식" copy="총 4라운드 · 라운드당 8분 대화" />
        <InfoRow icon={ShieldCheck} title="안전 안내" copy="불편한 상황은 즉시 호스트 호출을 눌러주세요." />
      </div>
    </div>
  )
}

function GuestRoundScreen() {
  return (
    <div className="screen-stack">
      <section className="timer-card guest-timer">
        <div className="timer-top">
          <span>
            <Clock3 size={16} />
            라운드 2 진행 중
          </span>
        </div>
        <strong>06:42</strong>
        <div className="progress">
          <span />
        </div>
        <p>현재 대화 상대는 B1 박민재 님입니다.</p>
      </section>

      <section className="seat-card">
        <span>A1</span>
        <div>
          <h3>다음 이동 안내</h3>
          <p>종료 알림 후 A2 테이블로 이동해 주세요.</p>
        </div>
      </section>

      <button className="ds-button support-button">
        <ShieldCheck size={18} />
        호스트 호출
      </button>
    </div>
  )
}

function GuestChoiceScreen() {
  return (
    <div className="screen-stack">
      <section className="choice-hero">
        <p className="eyebrow">PRIVATE CHOICE</p>
        <h3>오늘 다시 만나고 싶은 분을 선택하세요.</h3>
        <p>상대에게는 상호 선택일 때만 결과가 공개됩니다.</p>
      </section>

      <div className="choice-list">
        {guestChoices.map(([name, seat, copy], index) => (
          <button aria-pressed={index === 0} className={index === 0 ? "choice-card selected" : "choice-card"} key={name}>
            <span>{seat}</span>
            <div>
              <strong>{name}</strong>
              <p>{copy}</p>
            </div>
            <Heart size={18} />
          </button>
        ))}
      </div>

      <button className="ds-button primary-action">
        <ClipboardCheck size={18} />
        선택 제출
      </button>
    </div>
  )
}

function InfoRow({ icon: Icon, title, copy }: { icon: typeof CalendarCheck; title: string; copy: string }) {
  return (
    <article className="info-row">
      <Icon size={18} />
      <div>
        <strong>{title}</strong>
        <p>{copy}</p>
      </div>
    </article>
  )
}

function Metric({ icon: Icon, label, value }: { icon: typeof UserCheck; label: string; value: string }) {
  return (
    <div className="metric">
      <Icon size={18} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function StatusDot({ status }: { status: GuestStatus }) {
  return <span className={`status-dot ${status}`} aria-label={status} />
}

function HostBottomBar({ tab, setTab }: { tab: HostTab; setTab: (tab: HostTab) => void }) {
  return (
    <nav className="bottom-nav" aria-label="호스트 하단 화면 전환">
      {[
        ["dashboard", UsersRound, "현황"],
        ["rotation", RotateCcw, "이동"],
        ["matches", Sparkles, "매칭"],
      ].map(([id, Icon, label]) => {
        const NavIcon = Icon as typeof UsersRound
        return (
          <button
            aria-pressed={tab === id}
            className={tab === id ? "active" : ""}
            key={id as string}
            onClick={() => setTab(id as HostTab)}
          >
            <NavIcon size={18} />
            {label as string}
          </button>
        )
      })}
    </nav>
  )
}

function GuestBottomBar({ tab, setTab }: { tab: GuestTab; setTab: (tab: GuestTab) => void }) {
  return (
    <nav className="bottom-nav" aria-label="사용자 하단 화면 전환">
      {[
        ["ticket", CalendarCheck, "참가권"],
        ["round", Clock3, "라운드"],
        ["choice", Heart, "선택"],
      ].map(([id, Icon, label]) => {
        const NavIcon = Icon as typeof CalendarCheck
        return (
          <button
            aria-pressed={tab === id}
            className={tab === id ? "active" : ""}
            key={id as string}
            onClick={() => setTab(id as GuestTab)}
          >
            <NavIcon size={18} />
            {label as string}
          </button>
        )
      })}
    </nav>
  )
}

export default App
