import React, { useState, useMemo } from 'react';

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
        { left: 68, top: 72 },
];

const NuclearFusion = () => {
        // State Management

        const [showStep1, setShowStep1] = useState(false);

        const starPositions = useMemo(() => {
                return Array.from({ length: STAR_COUNT }, () => ({
                        left: 5 + Math.random() * 90,
                        top: 5 + Math.random() * 90,
                        size: Math.random() < 0.2 ? 2 : 1,
                }));
        }, []);

        const handleReset = () => {
                setShowStep1(false);
        }

        // Functions
        const handleBeginClick = () => {
                setShowStep1(true);
        }


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
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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
                                                        animation: `${SUN_FADE_ANIMATION}, ${SUN_ZOOM_ANIMATION}`,
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
                                                                animation: `${SUN_FADE_ANIMATION}, ${SUN_HIGHLIGHT_FADE_ANIMATION}`,
                                                        }}
                                                />
                                        </div>
                                        {PRESET_HYDROGEN_POSITIONS.map((pos, i) => (
                                                <div
                                                        key={i}
                                                        className="absolute rounded-full z-20"
                                                        style={{
                                                                left: `${pos.left}%`,
                                                                top: `${pos.top}%`,
                                                                width: 10,
                                                                height: 10,
                                                                transform: 'translate(-50%, -50%)',
                                                                background: 'radial-gradient(circle at 35% 35%, #bbdefb, #64b5f6 40%, #42a5f5 70%, #1e88e5)',
                                                                boxShadow: '0 0 8px 2px rgba(33, 150, 243, 0.4), inset -1px -1px 2px rgba(0,0,0,0.2)',
                                                                animation: `${HYDROGEN_FADE_ANIMATION}, hydrogenShake ${HYDROGEN_SHAKE_DURATION}s ease-in-out ${7800 + i * HYDROGEN_SHAKE_STAGGER_MS}ms infinite`,
                                                        }}
                                                />
                                        ))}
                                </div>
                        )}
                </Container>
        )
};


export default NuclearFusion;