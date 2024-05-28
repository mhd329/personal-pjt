import os
import sys
from moviepy.editor import VideoFileClip

def main(args):
    flag = False
    input_path = None
    output_path = None
    """
    사용법 : video path를 인자로 준다.
    """
    if len(args) > 1:
        input_path = args[1]
        output_path = input_path
    if len(args) > 2:
        output_path = args[2]
    assert input_path is not None, "입력 경로를 입력해주세요."

    try:
        video = VideoFileClip(input_path)
        audio = video.audio
        audio.write_audiofile(output_path, codec="aac") # 코덱은 소문자로 작성
        flag = True
    except Exception as error:
        print(f"Error : {error}")
    finally:
        assert flag is True, "알 수 없는 에러 발생."
        video.close()
        audio.close()
    return flag

if __name__ == "__main__":
    main(sys.argv)