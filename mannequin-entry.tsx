import Mannequin from './app/mannequin/scene';
import LeverMannequin from './app/mannequin/levers';
import CoreMannequin from './app/mannequin/core';
(window as unknown as {__mannequin:Record<string,unknown>}).__mannequin={default:Mannequin,levers:LeverMannequin,core:CoreMannequin};
