import parselmouth as snd
import numpy as np
import json

def normalize(arr):
    
    u = np.mean(arr)
    s = np.std(arr)
    filtered = [e if (u - 2 * s < e < u + 2 * s) else 0 for e in arr]

    return filtered

def pitch(f):

    s = snd.Sound(f.name)

    pitch = s.to_pitch()
    pitch_values = pitch.selected_array['frequency']

    x_y_data = list(zip(normalize(pitch.xs()), normalize(pitch_values)))
    x_lim, y_lim = (0, pitch.ceiling)
    x_y = [{'x': tup[0], 'y': tup[1]} for tup in x_y_data]
    return json.dumps({'x_y': x_y})