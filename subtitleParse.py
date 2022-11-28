def subtitleParse():
    file1 = open('subsrc.txt', 'r')
    lines1 = file1.readlines()
    with open("parsedFile.txt", "w") as fp:
        print(lines1[0])
        newline= lines1[0].replace("->", "\n")
        fp.writelines(newline)
    file1.close()


subtitleParse()