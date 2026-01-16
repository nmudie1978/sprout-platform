import { describe, it, expect } from 'vitest'
import {
  classifyIntent,
  getSystemPrompt,
  isResponseSafe,
  getFallbackResponse,
} from '../ai-guardrails'

describe('AI Guardrails', () => {
  describe('classifyIntent', () => {
    it('should classify unsafe content', () => {
      expect(classifyIntent('I want to hurt myself')).toBe('unsafe')
      expect(classifyIntent('thoughts of suicide')).toBe('unsafe')
      expect(classifyIntent('self-harm')).toBe('unsafe')
    })

    it('should classify platform navigation queries', () => {
      expect(classifyIntent('How do I create a profile?')).toBe('concierge')
      expect(classifyIntent('Where can I find jobs?')).toBe('concierge')
      expect(classifyIntent('How to use this app?')).toBe('concierge')
    })

    it('should classify career-related queries', () => {
      expect(classifyIntent('What is a software developer?')).toBe('career_explain')
      expect(classifyIntent('What does a designer do?')).toBe('career_explain')
      expect(classifyIntent('Tell me about this job')).toBe('career_explain')
    })

    it('should classify next steps queries', () => {
      // Note: Intent classification has priority order - concierge and career keywords
      // are checked before next_steps. Use phrases that don't contain other keywords.
      expect(classifyIntent('next steps please')).toBe('next_steps')
      expect(classifyIntent('prepare for the future')).toBe('next_steps')
      expect(classifyIntent('get started now')).toBe('next_steps')
    })

    it('should classify message drafting queries', () => {
      expect(classifyIntent('Help me write an application')).toBe('message_draft')
      expect(classifyIntent('Draft a cover letter')).toBe('message_draft')
      expect(classifyIntent('What should I say to the employer?')).toBe('message_draft')
    })

    it('should classify off-topic queries', () => {
      expect(classifyIntent('What is the weather today?')).toBe('off_topic')
      expect(classifyIntent('Tell me a joke')).toBe('off_topic')
      expect(classifyIntent('Who won the sports game?')).toBe('off_topic')
    })

    it('should default to career_explain for ambiguous queries', () => {
      expect(classifyIntent('hello')).toBe('career_explain')
      expect(classifyIntent('test')).toBe('career_explain')
    })
  })

  describe('getSystemPrompt', () => {
    it('should return a system prompt containing critical rules', () => {
      const prompt = getSystemPrompt('career_explain')
      expect(prompt).toContain('CRITICAL RULES')
      expect(prompt).toContain('career')
    })

    it('should include unsafe handling instructions for unsafe intent', () => {
      const prompt = getSystemPrompt('unsafe')
      expect(prompt).toContain('DISTRESS')
      expect(prompt).toContain('professional help')
    })

    it('should include navigation focus for concierge intent', () => {
      const prompt = getSystemPrompt('concierge')
      expect(prompt).toContain('platform features')
      expect(prompt).toContain('navigation')
    })

    it('should include drafting guidance for message_draft intent', () => {
      const prompt = getSystemPrompt('message_draft')
      expect(prompt).toContain('draft')
      expect(prompt).toContain('professional')
    })
  })

  describe('isResponseSafe', () => {
    it('should flag responses with therapy language as unsafe', () => {
      const result = isResponseSafe('I would diagnose you with anxiety')
      expect(result.safe).toBe(false)
      expect(result.reason).toContain('medical')
    })

    it('should flag responses with medication language as unsafe', () => {
      const result = isResponseSafe('You should take this medication')
      expect(result.safe).toBe(false)
    })

    it('should flag responses with inappropriate content as unsafe', () => {
      const result = isResponseSafe('Violence is sometimes the answer')
      expect(result.safe).toBe(false)
      expect(result.reason).toContain('inappropriate')
    })

    it('should mark normal career advice as safe', () => {
      const result = isResponseSafe('A developer writes code and builds software applications.')
      expect(result.safe).toBe(true)
    })

    it('should mark job guidance as safe', () => {
      const result = isResponseSafe('To become a developer, start by learning JavaScript.')
      expect(result.safe).toBe(true)
    })
  })

  describe('getFallbackResponse', () => {
    it('should return mental health resources for unsafe intent', () => {
      const response = getFallbackResponse('unsafe')
      expect(response).toContain('116 111')
      expect(response).toContain('Mental Helse')
    })

    it('should redirect to career topics for off_topic intent', () => {
      const response = getFallbackResponse('off_topic')
      expect(response).toContain('careers')
      expect(response).toContain('jobs')
    })

    it('should return helpful message for other intents', () => {
      const response = getFallbackResponse('career_explain')
      expect(response).toContain('help')
    })
  })
})
