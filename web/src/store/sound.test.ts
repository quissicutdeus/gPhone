import { describe, it, expect, beforeEach } from "vitest";
import { soundService, soundMuted, soundVolume } from "./sound";
import { get } from "svelte/store";

describe("soundService", () => {
    beforeEach(() => {
        soundMuted.set(false);
        soundVolume.set(0.5);
    });

    it("allows updating volume and mute states", () => {
        soundVolume.set(0.8);
        expect(get(soundVolume)).toBe(0.8);

        soundMuted.set(true);
        expect(get(soundMuted)).toBe(true);
    });

    it("triggers play method without throwing error", () => {
        expect(() => {
            soundService.play("click");
            soundService.play("pop");
            soundService.play("camera");
            soundService.play("notification");
        }).not.toThrow();
    });

    it("respects mute setting", () => {
        soundMuted.set(true);
        expect(() => {
            soundService.play("notification");
        }).not.toThrow();
    });
});
