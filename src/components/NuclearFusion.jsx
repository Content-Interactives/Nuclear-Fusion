import React, { useState, useMemo, useRef, useEffect } from 'react';

// UI Components Imports
import { Container } from './ui/reused-ui/Container.jsx'
import { GlowButton } from './ui/reused-ui/GlowButton.jsx'

// UI Animation Imports
import './ui/reused-animations/fade.css';
import './ui/reused-animations/scale.css';
import './ui/reused-animations/glow.css';


const STAR_COUNT = 65;
const SUN_FADE_ANIMATION = 'fadeInInPlaceAnimation 2.5s ease-in-out 1600ms both';
const STARS_ANIMATION = 'fadeInInPlaceAnimation 2.5s ease-in-out 2600ms both';
const SUN_ZOOM_ANIMATION = 'sunZoomInAnimation 3.5s ease-in-out 5200ms both';
const SUN_HIGHLIGHT_FADE_ANIMATION = 'sunHighlightFadeAnimation 3.5s ease-in-out 5200ms both';
const HYDROGEN_FADE_ANIMATION = 'fadeInInPlaceAnimation 0.6s ease-out 7800ms both';
const HYDROGEN_SHAKE_DURATION = 2.6;
const HYDROGEN_SHAKE_STAGGER_MS = 140;
const CAMERA_ZOOM_PHASE2_ANIMATION = 'cameraZoomInPhase2 3s ease-in-out 9000ms both';
const TEXT_FADE_ANIMATION = 'fadeInInPlaceAnimation 1s ease-in-out 8000ms both';
const CONTINUE_BUTTON_ANIMATION = 'fadeInInPlaceAnimation 0.8s ease-in-out 12500ms both';
const SUN_FLATTEN_ANIMATION = 'sunFlattenAnimation 3s ease-in-out 9000ms both';
const SUN_HIGHLIGHT_FADE_OUT_ANIMATION = 'sunHighlightFadeOutAnimation 3s ease-in-out 9000ms both';
const CAMERA_ZOOM_OUT_ANIMATION = 'cameraZoomOutPhase2 2.5s ease-in-out 600ms both';
const CAMERA_ZOOM_OUT_PHASE3_ANIMATION = 'cameraZoomOutPhase3 2.5s ease-in-out forwards';
const HELIUM_FADEOUT_DURATION = '1.2s';
const SUN_ZOOM_OUT_ANIMATION = 'sunZoomOutAnimation 2.5s ease-in-out forwards';
const SUN_UNFLATTEN_ANIMATION = 'sunUnflattenAnimation 2.5s ease-in-out forwards';
const SUN_HIGHLIGHT_RETURN_ANIMATION = 'sunHighlightReturnAnimation 2.5s ease-in-out forwards';
const PRESET_HYDROGEN_POSITIONS = [
        { left: 42, top: 50 },
        { left: 58, top: 50 },
        { left: 8, top: 18 },
        { left: 13, top: 29 },
        { left: 7, top: 51 },
        { left: 14, top: 65 },
        { left: 11, top: 82 },
        { left: 25, top: 19 },
        { left: 19, top: 48 },
        { left: 26, top: 81 },
        { left: 31, top: 33 },
        { left: 26, top: 68 },
        { left: 48, top: 9 },
        { left: 53, top: 25 },
        { left: 47, top: 76 },
        { left: 52, top: 91 },
        { left: 69, top: 31 },
        { left: 75, top: 62 },
        { left: 81, top: 18 },
        { left: 76, top: 52 },
        { left: 83, top: 74 },
        { left: 87, top: 11 },
        { left: 92, top: 35 },
        { left: 88, top: 48 },
        { left: 93, top: 71 },
        { left: 91, top: 88 },
        { left: 38, top: 22 },
        { left: 62, top: 29 },
        { left: 33, top: 78 },
        { left: 68, top: 67 },
];

const MAIN_ATOM_1_ORIGINAL = { left: 42, top: 50 };
const MAIN_ATOM_2_ORIGINAL = { left: 58, top: 50 };
const FUSE_DISTANCE_PX = 5;
const SNAP_BACK_DURATION_MS = 400;

const BACKGROUND_HYDROGENS = PRESET_HYDROGEN_POSITIONS.slice(2);
const PAIR_COUNT = Math.floor(BACKGROUND_HYDROGENS.length / 2);
const ZOOM_OUT_PAIR_DELAY_MS = 600;
const PAIR_DURATION_MIN_MS = 1800;
const PAIR_DURATION_RANGE_MS = 1200;

const NuclearFusion = () => {
        // State Management

        const [showStep1, setShowStep1] = useState(false);
        const [showFusionText, setShowFusionText] = useState(false);
        const [mainAtom1Pos, setMainAtom1Pos] = useState(MAIN_ATOM_1_ORIGINAL);
        const [mainAtom2Pos, setMainAtom2Pos] = useState(MAIN_ATOM_2_ORIGINAL);
        const [promptFaded, setPromptFaded] = useState(false);
        const [fusedPairIndices, setFusedPairIndices] = useState([]);
        const [showPostFusionText, setShowPostFusionText] = useState(false);
        const [postContinueClicked, setPostContinueClicked] = useState(false);
        const [draggingAtom, setDraggingAtom] = useState(null);
        const atomsContainerRef = useRef(null);
        const pos1Ref = useRef(MAIN_ATOM_1_ORIGINAL);
        const pos2Ref = useRef(MAIN_ATOM_2_ORIGINAL);

        const backgroundFusionTargets = useMemo(() => {
                return BACKGROUND_HYDROGENS.map((pos, i) => {
                        const pairIndex = Math.floor(i / 2);
                        const i2 = pairIndex * 2 + 1;
                        if (i2 < BACKGROUND_HYDROGENS.length) {
                                const a = BACKGROUND_HYDROGENS[pairIndex * 2];
                                const b = BACKGROUND_HYDROGENS[i2];
                                return { left: (a.left + b.left) / 2, top: (a.top + b.top) / 2 };
                        }
                        return pos;
                });
        }, []);

        const pairMidpoints = useMemo(() => {
                return Array.from({ length: PAIR_COUNT }, (_, p) => backgroundFusionTargets[p * 2]);
        }, [backgroundFusionTargets]);

        const pairTransitionDurationsMs = useMemo(() => (
                Array.from({ length: PAIR_COUNT }, () => PAIR_DURATION_MIN_MS + Math.random() * PAIR_DURATION_RANGE_MS)
        ), []);

        useEffect(() => {
                if (!promptFaded) return;
                const timeouts = pairTransitionDurationsMs.map((durationMs, p) =>
                        setTimeout(() => {
                                setFusedPairIndices(prev => (prev.includes(p) ? prev : [...prev, p]));
                        }, ZOOM_OUT_PAIR_DELAY_MS + durationMs)
                );
                return () => timeouts.forEach(clearTimeout);
        }, [promptFaded, pairTransitionDurationsMs]);

        useEffect(() => {
                if (fusedPairIndices.length !== PAIR_COUNT) return;
                const t = setTimeout(() => setShowPostFusionText(true), 700);
                return () => clearTimeout(t);
        }, [fusedPairIndices.length]);

        const starPositions = useMemo(() => {
                return Array.from({ length: STAR_COUNT }, () => ({
                        left: 5 + Math.random() * 90,
                        top: 5 + Math.random() * 90,
                        size: Math.random() < 0.2 ? 2 : 1,
                }));
        }, []);

        const handleReset = () => {
                setShowStep1(false);
                setShowFusionText(false);
                setMainAtom1Pos(MAIN_ATOM_1_ORIGINAL);
                setMainAtom2Pos(MAIN_ATOM_2_ORIGINAL);
                setPromptFaded(false);
                setFusedPairIndices([]);
                setShowPostFusionText(false);
                setPostContinueClicked(false);
                setDraggingAtom(null);
                pos1Ref.current = MAIN_ATOM_1_ORIGINAL;
                pos2Ref.current = MAIN_ATOM_2_ORIGINAL;
        }

        // Functions
        const handleBeginClick = () => {
                setShowStep1(true);
        }

        const handleContinueClick = () => {
                setShowFusionText(true);
        }

        const handlePostContinueClick = () => {
                setPostContinueClicked(true);
        }

        const clientToPercent = (clientX, clientY) => {
                const el = atomsContainerRef.current;
                if (!el) return { left: 50, top: 50 };
                const rect = el.getBoundingClientRect();
                const left = ((clientX - rect.left) / rect.width) * 100;
                const top = ((clientY - rect.top) / rect.height) * 100;
                return { left: Math.max(0, Math.min(100, left)), top: Math.max(0, Math.min(100, top)) };
        };

        const distancePx = (a, b) => {
                const el = atomsContainerRef.current;
                if (!el) return Infinity;
                const w = el.offsetWidth;
                const h = el.offsetHeight;
                if (!w || !h) return Infinity;
                const x1 = (a.left / 100) * w;
                const y1 = (a.top / 100) * h;
                const x2 = (b.left / 100) * w;
                const y2 = (b.top / 100) * h;
                return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
        };

        const handleAtomPointerDown = (which, e) => {
                e.preventDefault();
                setDraggingAtom(which);
        };

        useEffect(() => {
                pos1Ref.current = mainAtom1Pos;
                pos2Ref.current = mainAtom2Pos;
        }, [mainAtom1Pos, mainAtom2Pos]);

        useEffect(() => {
                if (draggingAtom === null) return;
                const move = (e) => {
                        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                        const { left, top } = clientToPercent(clientX, clientY);
                        const draggedPos = { left, top };
                        if (draggingAtom === 1) {
                                setMainAtom1Pos(draggedPos);
                                pos1Ref.current = draggedPos;
                        } else {
                                setMainAtom2Pos(draggedPos);
                                pos2Ref.current = draggedPos;
                        }
                        const otherPos = draggingAtom === 1 ? pos2Ref.current : pos1Ref.current;
                        const d = distancePx(draggedPos, otherPos);
                        if (d < FUSE_DISTANCE_PX) setPromptFaded(true);
                };
                const up = () => {
                        const d = distancePx(pos1Ref.current, pos2Ref.current);
                        if (d < FUSE_DISTANCE_PX) setPromptFaded(true);
                        else {
                                setMainAtom1Pos(MAIN_ATOM_1_ORIGINAL);
                                setMainAtom2Pos(MAIN_ATOM_2_ORIGINAL);
                        }
                        setDraggingAtom(null);
                };
                window.addEventListener('mousemove', move);
                window.addEventListener('mouseup', up);
                window.addEventListener('touchmove', move, { passive: false });
                window.addEventListener('touchend', up);
                return () => {
                        window.removeEventListener('mousemove', move);
                        window.removeEventListener('mouseup', up);
                        window.removeEventListener('touchmove', move);
                        window.removeEventListener('touchend', up);
                };
        }, [draggingAtom]);


	return (
                <Container text="Nuclear Fusion" showResetButton={true} onReset={handleReset} contentDark={showStep1}>
                        {!showStep1 && (
                                <div className="w-full h-full flex justify-center items-center">
                                        <GlowButton text="Begin Interactive" autoShrinkOnClick={true}
                                        onClick={handleBeginClick}>
                                                Begin Interactive
                                        </GlowButton>
                                </div>
                        )}
                        {showStep1 && (
                                <>
                                        <div className="absolute top-[120px] left-0 right-0 text-center pointer-events-none z-30 min-h-[3rem] flex flex-col items-center justify-center">
                                                <p
                                                        className="text-white text-xl font-medium"
                                                        style={{
                                                                animation: showFusionText ? 'fadeOutInPlaceAnimation 0.5s ease-in-out forwards' : TEXT_FADE_ANIMATION,
                                                        }}
                                                >
                                                        Inside the sun is primarily hydrogen atoms.
                                                </p>
                                                {showFusionText && (
                                                        <p
                                                                className="text-white text-xl font-medium absolute left-0 right-0"
                                                                style={{
                                                                        animation: promptFaded
                                                                                ? 'fadeOutInPlaceAnimation 0.5s ease-in-out forwards'
                                                                                : 'fadeInInPlaceAnimation 0.6s ease-in-out forwards',
                                                                }}
                                                        >
                                                                In a process called nuclear fusion, these hydrogen atoms fuse together to form helium.
                                                        </p>
                                                )}
                                                {showPostFusionText && (
                                                        <p
                                                                className="text-white text-xl font-medium absolute left-0 right-0"
                                                                style={{
                                                                        animation: postContinueClicked
                                                                                ? 'fadeOutInPlaceAnimation 1s ease-in-out forwards'
                                                                                : 'fadeInInPlaceAnimation 1s ease-in-out forwards',
                                                                }}
                                                        >
                                                                In addition to helium, this fusion reaction produces incredible amounts of energy.
                                                        </p>
                                                )}
                                                {postContinueClicked && (
                                                        <p
                                                                className="text-white text-xl font-medium absolute left-0 right-0 top-[-30px]"
                                                                style={{
                                                                        animation: 'fadeInInPlaceAnimation 1s ease-in-out 2.5s forwards',
                                                                        animationFillMode: 'both',
                                                                }}
                                                        >
                                                                The energy from nuclear fusion is what lets the sun produce its light and heat.
                                                        </p>
                                                )}
                                        </div>
                                        {showFusionText && !promptFaded && (
                                                <p
                                                        className="absolute left-1/2 text-white text-sm font-light text-center pointer-events-none z-30"
                                                        style={{
                                                                top: '58%',
                                                                transform: 'translateX(-50%)',
                                                                animation: 'fadeInInPlaceAnimation 1.8s ease-in-out 0.45s forwards',
                                                                animationFillMode: 'both',
                                                        }}
                                                >
                                                        Drag these two hydrogen together!
                                                </p>
                                        )}
                                        {showFusionText && promptFaded && (
                                                <p
                                                        className="absolute left-1/2 text-white text-sm font-light text-center pointer-events-none z-30"
                                                        style={{
                                                                top: '58%',
                                                                transform: 'translateX(-50%)',
                                                                animation: 'fadeOutInPlaceAnimation 0.4s ease-in-out forwards',
                                                        }}
                                                >
                                                        Drag these two hydrogen together!
                                                </p>
                                        )}
                                        <div
                                                ref={atomsContainerRef}
                                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                                style={{
                                                        transformOrigin: '50% 50%',
                                                        animation: postContinueClicked
                                                                ? CAMERA_ZOOM_OUT_PHASE3_ANIMATION
                                                                : (promptFaded ? CAMERA_ZOOM_OUT_ANIMATION : CAMERA_ZOOM_PHASE2_ANIMATION),
                                                }}
                                        >
                                                {starPositions.map((star, i) => (
                                                        <div
                                                                key={i}
                                                                className="absolute rounded-full bg-white"
                                                                style={{
                                                                        left: `${star.left}%`,
                                                                        top: `${star.top}%`,
                                                                        width: star.size,
                                                                        height: star.size,
                                                                        transform: 'translate(-50%, -50%)',
                                                                        animation: STARS_ANIMATION,
                                                                }}
                                                        />
                                                ))}
                                                <div
                                                        className="w-24 h-24 rounded-full relative z-10"
                                                        style={{
                                                                animation: postContinueClicked
                                                                        ? SUN_ZOOM_OUT_ANIMATION
                                                                        : `${SUN_FADE_ANIMATION}, ${SUN_ZOOM_ANIMATION}`,
                                                        }}
                                                >
                                                        <div
                                                                className="absolute inset-0 rounded-full"
                                                                style={{
                                                                        background: 'radial-gradient(circle at 50% 50%, #ffb74d, #ff9800 45%, #f57c00 75%, #e65100)',
                                                                        boxShadow: '0 0 60px 20px rgba(255, 152, 0, 0.45), 0 0 100px 40px rgba(245, 124, 0, 0.25), inset -10px -10px 30px rgba(0,0,0,0.2)',
                                                                }}
                                                        />
                                                        <div
                                                                className="absolute inset-0 rounded-full pointer-events-none"
                                                                style={{
                                                                        background: 'radial-gradient(circle at 35% 35%, rgba(255,224,178,0.85) 0%, rgba(255,183,77,0.4) 25%, transparent 55%)',
                                                                        animation: postContinueClicked
                                                                                ? SUN_HIGHLIGHT_RETURN_ANIMATION
                                                                                : `${SUN_FADE_ANIMATION}, ${SUN_HIGHLIGHT_FADE_ANIMATION}, ${SUN_HIGHLIGHT_FADE_OUT_ANIMATION}`,
                                                                }}
                                                        />
                                                        <div
                                                                className="absolute inset-0 rounded-full pointer-events-none"
                                                                style={{
                                                                        background: '#ff9800',
                                                                        animation: postContinueClicked ? SUN_UNFLATTEN_ANIMATION : SUN_FLATTEN_ANIMATION,
                                                                }}
                                                        />
                                                </div>
                                                {/* Two main draggable hydrogen atoms */}
                                                <div
                                                        key="main-1"
                                                        className="absolute rounded-full z-20"
                                                        style={{
                                                                left: `${mainAtom1Pos.left}%`,
                                                                top: `${mainAtom1Pos.top}%`,
                                                                width: 10,
                                                                height: 10,
                                                                transform: 'translate(-50%, -50%)',
                                                                background: 'radial-gradient(circle at 35% 35%, #bbdefb, #64b5f6 40%, #42a5f5 70%, #1e88e5)',
                                                                boxShadow: '0 0 8px 2px rgba(33, 150, 243, 0.4), inset -1px -1px 2px rgba(0,0,0,0.2)',
                                                                animation: promptFaded
                                                                        ? 'hydrogenFadeOutInFlash 0.5s ease-out forwards'
                                                                        : `${HYDROGEN_FADE_ANIMATION}, hydrogenShake ${HYDROGEN_SHAKE_DURATION}s ease-in-out ${7800}ms infinite`,
                                                                transition: `left ${SNAP_BACK_DURATION_MS}ms ease-out, top ${SNAP_BACK_DURATION_MS}ms ease-out`,
                                                                ...(showFusionText && !promptFaded && { cursor: draggingAtom === 1 ? 'grabbing' : 'grab', pointerEvents: 'auto' }),
                                                        }}
                                                        onMouseDown={showFusionText && !promptFaded ? (e) => handleAtomPointerDown(1, e) : undefined}
                                                        onTouchStart={showFusionText && !promptFaded ? (e) => handleAtomPointerDown(1, e) : undefined}
                                                />
                                                <div
                                                        key="main-2"
                                                        className="absolute rounded-full z-20"
                                                        style={{
                                                                left: `${mainAtom2Pos.left}%`,
                                                                top: `${mainAtom2Pos.top}%`,
                                                                width: 10,
                                                                height: 10,
                                                                transform: 'translate(-50%, -50%)',
                                                                background: 'radial-gradient(circle at 35% 35%, #bbdefb, #64b5f6 40%, #42a5f5 70%, #1e88e5)',
                                                                boxShadow: '0 0 8px 2px rgba(33, 150, 243, 0.4), inset -1px -1px 2px rgba(0,0,0,0.2)',
                                                                animation: promptFaded
                                                                        ? 'hydrogenFadeOutInFlash 0.5s ease-out forwards'
                                                                        : `${HYDROGEN_FADE_ANIMATION}, hydrogenShake ${HYDROGEN_SHAKE_DURATION}s ease-in-out ${7800 + HYDROGEN_SHAKE_STAGGER_MS}ms infinite`,
                                                                transition: `left ${SNAP_BACK_DURATION_MS}ms ease-out, top ${SNAP_BACK_DURATION_MS}ms ease-out`,
                                                                ...(showFusionText && !promptFaded && { cursor: draggingAtom === 2 ? 'grabbing' : 'grab', pointerEvents: 'auto' }),
                                                        }}
                                                        onMouseDown={showFusionText && !promptFaded ? (e) => handleAtomPointerDown(2, e) : undefined}
                                                        onTouchStart={showFusionText && !promptFaded ? (e) => handleAtomPointerDown(2, e) : undefined}
                                                />
                                                {promptFaded && (
                                                        <>
                                                                <div
                                                                        className="absolute rounded-full pointer-events-none"
                                                                        style={{
                                                                                left: '50%',
                                                                                top: '50%',
                                                                                width: 80,
                                                                                height: 80,
                                                                                zIndex: 25,
                                                                                background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 40%, transparent 70%)',
                                                                                boxShadow: '0 0 40px 20px rgba(255,255,255,0.5)',
                                                                                animation: postContinueClicked ? 'none' : 'fusionFlashAnimation 0.5s ease-out forwards',
                                                                                opacity: postContinueClicked ? 0 : undefined,
                                                                        }}
                                                                />
                                                                {/* Helium atom: 2 blue (protons) + 2 red (neutrons) spheres stacked */}
                                                                <div
                                                                        className="absolute pointer-events-none"
                                                                        style={{
                                                                                left: '50%',
                                                                                top: '50%',
                                                                                width: 20,
                                                                                height: 20,
                                                                                zIndex: 26,
                                                                                animation: postContinueClicked
                                                                                        ? `fadeOutInPlaceAnimation ${HELIUM_FADEOUT_DURATION} ease-in-out forwards`
                                                                                        : 'heliumFadeInAnimation 0.4s ease-out 0.25s forwards',
                                                                                opacity: postContinueClicked ? 1 : 0,
                                                                        }}
                                                                >
                                                                        <div
                                                                                className="absolute rounded-full"
                                                                                style={{
                                                                                        left: 7,
                                                                                        top: 14,
                                                                                        width: 8,
                                                                                        height: 8,
                                                                                        transform: 'translate(-50%, -50%)',
                                                                                        background: 'radial-gradient(circle at 35% 35%, #bbdefb, #64b5f6 40%, #42a5f5 70%, #1e88e5)',
                                                                                        boxShadow: '0 0 6px 1px rgba(33, 150, 243, 0.5), inset -1px -1px 1px rgba(0,0,0,0.2)',
                                                                                }}
                                                                        />
                                                                        <div
                                                                                className="absolute rounded-full"
                                                                                style={{
                                                                                        right: 8,
                                                                                        top: 19,
                                                                                        width: 8,
                                                                                        height: 8,
                                                                                        transform: 'translate(50%, -50%)',
                                                                                        background: 'radial-gradient(circle at 35% 35%, #bbdefb, #64b5f6 40%, #42a5f5 70%, #1e88e5)',
                                                                                        boxShadow: '0 0 6px 1px rgba(33, 150, 243, 0.5), inset -1px -1px 1px rgba(0,0,0,0.2)',
                                                                                }}
                                                                        />
                                                                        <div
                                                                                className="absolute rounded-full"
                                                                                style={{
                                                                                        left: 7,
                                                                                        bottom: 0,
                                                                                        width: 8,
                                                                                        height: 8,
                                                                                        transform: 'translate(-50%, 50%)',
                                                                                        background: 'radial-gradient(circle at 35% 35%, #ffcdd2, #ef5350 40%, #e53935 70%, #c62828)',
                                                                                        boxShadow: '0 0 6px 1px rgba(244, 67, 54, 0.5), inset -1px -1px 1px rgba(0,0,0,0.2)',
                                                                                }}
                                                                        />
                                                                        <div
                                                                                className="absolute rounded-full"
                                                                                style={{
                                                                                        right: 8,
                                                                                        bottom: 6,
                                                                                        width: 8,
                                                                                        height: 8,
                                                                                        transform: 'translate(50%, 50%)',
                                                                                        background: 'radial-gradient(circle at 35% 35%, #ffcdd2, #ef5350 40%, #e53935 70%, #c62828)',
                                                                                        boxShadow: '0 0 6px 1px rgba(244, 67, 54, 0.5), inset -1px -1px 1px rgba(0,0,0,0.2)',
                                                                                }}
                                                                        />
                                                                </div>
                                                        </>
                                                )}
                                                {BACKGROUND_HYDROGENS.map((pos, i) => {
                                                        const pairIndex = Math.floor(i / 2);
                                                        if (promptFaded && fusedPairIndices.includes(pairIndex)) return null;
                                                        const target = backgroundFusionTargets[i];
                                                        const displayPos = promptFaded ? target : pos;
                                                        const durationMs = promptFaded ? pairTransitionDurationsMs[pairIndex] : 0;
                                                        return (
                                                                <div
                                                                        key={i + 2}
                                                                        className="absolute rounded-full z-20 pointer-events-none"
                                                                        style={{
                                                                                left: `${displayPos.left}%`,
                                                                                top: `${displayPos.top}%`,
                                                                                width: 10,
                                                                                height: 10,
                                                                                transform: 'translate(-50%, -50%)',
                                                                                background: 'radial-gradient(circle at 35% 35%, #bbdefb, #64b5f6 40%, #42a5f5 70%, #1e88e5)',
                                                                                boxShadow: '0 0 8px 2px rgba(33, 150, 243, 0.4), inset -1px -1px 2px rgba(0,0,0,0.2)',
                                                                                animation: promptFaded
                                                                                        ? undefined
                                                                                        : `${HYDROGEN_FADE_ANIMATION}, hydrogenShake ${HYDROGEN_SHAKE_DURATION}s ease-in-out ${7800 + (i + 2) * HYDROGEN_SHAKE_STAGGER_MS}ms infinite`,
                                                                                transition: promptFaded
                                                                                        ? `left ${durationMs}ms ease-in-out ${ZOOM_OUT_PAIR_DELAY_MS}ms, top ${durationMs}ms ease-in-out ${ZOOM_OUT_PAIR_DELAY_MS}ms`
                                                                                        : undefined,
                                                                        }}
                                                                />
                                                        );
                                                })}
                                                {promptFaded && fusedPairIndices.map((p) => {
                                                        const mid = pairMidpoints[p];
                                                        return (
                                                        <React.Fragment key={`pair-fusion-${p}`}>
                                                                <div
                                                                        className="absolute rounded-full pointer-events-none"
                                                                        style={{
                                                                                left: `${mid.left}%`,
                                                                                top: `${mid.top}%`,
                                                                                width: 80,
                                                                                height: 80,
                                                                                transform: 'translate(-50%, -50%)',
                                                                                zIndex: 25,
                                                                                background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 40%, transparent 70%)',
                                                                                boxShadow: '0 0 40px 20px rgba(255,255,255,0.5)',
                                                                                animation: postContinueClicked ? 'none' : 'fusionFlashAnimation 0.5s ease-out forwards',
                                                                                opacity: postContinueClicked ? 0 : undefined,
                                                                        }}
                                                                />
                                                                <div
                                                                        className="absolute pointer-events-none"
                                                                        style={{
                                                                                left: `${mid.left}%`,
                                                                                top: `${mid.top}%`,
                                                                                width: 20,
                                                                                height: 20,
                                                                                zIndex: 26,
                                                                                transform: 'translate(-50%, -50%)',
                                                                                animation: postContinueClicked
                                                                                        ? `fadeOutInPlaceAnimation ${HELIUM_FADEOUT_DURATION} ease-in-out forwards`
                                                                                        : 'heliumFadeInAnimation 0.4s ease-out 0.25s forwards',
                                                                                opacity: postContinueClicked ? 1 : 0,
                                                                        }}
                                                                >
                                                                        <div
                                                                                className="absolute rounded-full"
                                                                                style={{
                                                                                        left: 7,
                                                                                        top: 14,
                                                                                        width: 8,
                                                                                        height: 8,
                                                                                        transform: 'translate(-50%, -50%)',
                                                                                        background: 'radial-gradient(circle at 35% 35%, #bbdefb, #64b5f6 40%, #42a5f5 70%, #1e88e5)',
                                                                                        boxShadow: '0 0 6px 1px rgba(33, 150, 243, 0.5), inset -1px -1px 1px rgba(0,0,0,0.2)',
                                                                                }}
                                                                        />
                                                                        <div
                                                                                className="absolute rounded-full"
                                                                                style={{
                                                                                        right: 8,
                                                                                        top: 19,
                                                                                        width: 8,
                                                                                        height: 8,
                                                                                        transform: 'translate(50%, -50%)',
                                                                                        background: 'radial-gradient(circle at 35% 35%, #bbdefb, #64b5f6 40%, #42a5f5 70%, #1e88e5)',
                                                                                        boxShadow: '0 0 6px 1px rgba(33, 150, 243, 0.5), inset -1px -1px 1px rgba(0,0,0,0.2)',
                                                                                }}
                                                                        />
                                                                        <div
                                                                                className="absolute rounded-full"
                                                                                style={{
                                                                                        left: 7,
                                                                                        bottom: 0,
                                                                                        width: 8,
                                                                                        height: 8,
                                                                                        transform: 'translate(-50%, 50%)',
                                                                                        background: 'radial-gradient(circle at 35% 35%, #ffcdd2, #ef5350 40%, #e53935 70%, #c62828)',
                                                                                        boxShadow: '0 0 6px 1px rgba(244, 67, 54, 0.5), inset -1px -1px 1px rgba(0,0,0,0.2)',
                                                                                }}
                                                                        />
                                                                        <div
                                                                                className="absolute rounded-full"
                                                                                style={{
                                                                                        right: 8,
                                                                                        bottom: 6,
                                                                                        width: 8,
                                                                                        height: 8,
                                                                                        transform: 'translate(50%, 50%)',
                                                                                        background: 'radial-gradient(circle at 35% 35%, #ffcdd2, #ef5350 40%, #e53935 70%, #c62828)',
                                                                                        boxShadow: '0 0 6px 1px rgba(244, 67, 54, 0.5), inset -1px -1px 1px rgba(0,0,0,0.2)',
                                                                                }}
                                                                        />
                                                                </div>
                                                        </React.Fragment>
                                                        );
                                                })}
                                        </div>
                                        {!showFusionText && (
                                                <div
                                                        className="absolute bottom-1 right-1 pointer-events-auto z-30"
                                                        style={{
                                                                animation: CONTINUE_BUTTON_ANIMATION,
                                                        }}
                                                >
                                                        <GlowButton
                                                                text="Continue"
                                                                autoShrinkOnClick={true}
                                                                onClick={handleContinueClick}
                                                                bgColor="#ff9800"
                                                        >
                                                                Continue
                                                        </GlowButton>
                                                </div>
                                        )}
                                        {showPostFusionText && !postContinueClicked && (
                                                <div
                                                        className="absolute bottom-1 right-1 pointer-events-auto z-30"
                                                        style={{
                                                                animation: 'fadeInInPlaceAnimation 0.8s ease-in-out forwards',
                                                        }}
                                                >
                                                        <GlowButton
                                                                text="Continue"
                                                                autoShrinkOnClick={true}
                                                                onClick={handlePostContinueClick}
                                                                bgColor="#ff9800"
                                                        >
                                                                Continue
                                                        </GlowButton>
                                                </div>
                                        )}
                                </>
                        )}
                </Container>
        )
};


export default NuclearFusion;