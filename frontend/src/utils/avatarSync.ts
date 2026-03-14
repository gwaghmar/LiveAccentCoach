/**
 * Avatar synchronization utility
 * Maps MediaPipe blendshapes to three.js morph targets
 */

import { BlendShape } from '../types';

export class AvatarSync {
  /**
   * Map MediaPipe blendshape names to three.js morph target names
   * This mapping depends on the 3D model used
   */
  private static readonly BLENDSHAPE_MAPPING: Record<string, string> = {
    // Mouth shapes
    'mouthOpen': 'jawOpen',
    'mouthPucker': 'mouthPucker',
    'mouthFunnel': 'mouthFunnel',
    'mouthPressAndTighten': 'mouthTighten',
    
    // Jaw
    'jawOpen': 'jawOpen',
    'jawForward': 'jawForward',
    'jawLeft': 'jawLeft',
    'jawRight': 'jawRight',
    
    // Eye
    'eyeBlinkLeft': 'blinkLeft',
    'eyeBlinkRight': 'blinkRight',
    'eyeLookUpLeft': 'lookUpLeft',
    'eyeLookUpRight': 'lookUpRight',
    'eyeLookDownLeft': 'lookDownLeft',
    'eyeLookDownRight': 'lookDownRight',
    
    // Eyebrow
    'browInnerUp': 'browInnerUp',
    'browDownLeft': 'browDownLeft',
    'browDownRight': 'browDownRight',
    'browOuterUpLeft': 'browOuterUpLeft',
    'browOuterUpRight': 'browOuterUpRight',
  };
  
  /**
   * Convert MediaPipe blendshapes to three.js morph target influences
   */
  static convertBlendShapesToMorphTargets(
    blendshapes: BlendShape[]
  ): Record<string, number> {
    const morphTargets: Record<string, number> = {};
    
    blendshapes.forEach(bs => {
      const targetName = this.BLENDSHAPE_MAPPING[bs.categoryName];
      if (targetName) {
        morphTargets[targetName] = bs.score;
      }
    });
    
    return morphTargets;
  }
  
  /**
   * Apply morph target influences to a three.js mesh
   */
  static applyMorphTargets(
    mesh: any,
    morphTargets: Record<string, number>
  ): void {
    if (!mesh.morphTargetInfluences || !mesh.morphTargetDictionary) {
      return;
    }
    
    Object.entries(morphTargets).forEach(([name, value]) => {
      const index = mesh.morphTargetDictionary[name];
      if (index !== undefined) {
        mesh.morphTargetInfluences[index] = Math.min(1, Math.max(0, value));
      }
    });
  }
  
  /**
   * Smooth blendshape values for more natural avatar movement
   */
  static smoothBlendShapes(
    current: BlendShape[],
    previous: BlendShape[] | null,
    smoothingFactor: number = 0.3
  ): BlendShape[] {
    if (!previous) return current;
    
    return current.map(blend => {
      const prevBlend = previous.find(b => b.categoryName === blend.categoryName);
      if (!prevBlend) return blend;
      
      const smoothedScore = prevBlend.score + (blend.score - prevBlend.score) * smoothingFactor;
      
      return {
        categoryName: blend.categoryName,
        score: smoothedScore,
      };
    });
  }
}
