import { useState } from 'react';
import { useAudio } from '../audio/audioStore';
import { previewSfx } from '../audio/sound';

// Topbar audio control: a single 🔊 button that opens a bottom-sheet with a mute
// toggle plus independent music and SFX volume sliders (persisted via the store).
// Dragging the SFX slider plays a short blip so the level is audible. Shared by
// the play topbar and the menu/ending topbar so there is one audio control.
export function AudioPanel({ triggerClassName }: { triggerClassName?: string }) {
  const muted = useAudio((s) => s.muted);
  const musicVol = useAudio((s) => s.musicVol);
  const sfxVol = useAudio((s) => s.sfxVol);
  const toggleMuted = useAudio((s) => s.toggleMuted);
  const setMusicVol = useAudio((s) => s.setMusicVol);
  const setSfxVol = useAudio((s) => s.setSfxVol);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={triggerClassName ?? 'pixel-btn pixel-btn--ghost topbar__btn'}
        onClick={() => setOpen(true)}
        aria-label="声音设置"
      >
        {muted ? '🔇' : '🔊'}
      </button>
      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal modal--audio" onClick={(e) => e.stopPropagation()}>
            <div className="modal__kicker">声音</div>
            <div className="audio-row audio-row--mute">
              <span className="audio-row__label">总开关</span>
              <button
                className={`pixel-btn ${muted ? '' : 'pixel-btn--primary'} audio-mute-btn`}
                onClick={toggleMuted}
              >
                {muted ? '🔇 已静音' : '🔊 开'}
              </button>
            </div>
            <label className="audio-row">
              <span className="audio-row__label">
                音乐 <b>{Math.round(musicVol * 100)}</b>
              </span>
              <input
                className="audio-slider"
                type="range"
                min={0}
                max={100}
                value={Math.round(musicVol * 100)}
                disabled={muted}
                onChange={(e) => setMusicVol(Number(e.target.value) / 100)}
                aria-label="音乐音量"
              />
            </label>
            <label className="audio-row">
              <span className="audio-row__label">
                音效 <b>{Math.round(sfxVol * 100)}</b>
              </span>
              <input
                className="audio-slider"
                type="range"
                min={0}
                max={100}
                value={Math.round(sfxVol * 100)}
                disabled={muted}
                onChange={(e) => {
                  const v = Number(e.target.value) / 100;
                  setSfxVol(v);
                  if (!muted && v > 0) previewSfx();
                }}
                aria-label="音效音量"
              />
            </label>
            <button className="pixel-btn audio-done" onClick={() => setOpen(false)}>
              完成
            </button>
          </div>
        </div>
      )}
    </>
  );
}
