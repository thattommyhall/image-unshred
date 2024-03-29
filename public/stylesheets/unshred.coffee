window.onload = ->
  imageObj = new Image()
  imageObj.src = "images/TokyoPanoramaShredded.png"
  imageObj.onload = ->
    drawImages(this)

drawImages = (imageObj) ->
  shredded = document.getElementById("shredded")
  shredded_context = shredded.getContext("2d")
  shredded_context.drawImage(imageObj, 0, 0)

  unshredded = document.getElementById("unshredded")
  unshredded_context = unshredded.getContext("2d")
  imageData = shredded_context.getImageData(0, 0, unshredded.width, unshredded.height)
  data = imageData.data

  STRIP_WIDTH = 32
  STRIP_HEIGHT = 359

  getPixel = (x,y) ->
    start = imageData.width * 4 * y + x * 4
    [data[start],data[start+1],data[start+2],data[start+3]]

  pixel_difference = (x1,y1,x2,y2) ->
    total = 0
    one = getPixel(x1,y1)
    two = getPixel(x2,y2)

    ## New 'heuristic' difference
    for i in [0..3]
      return 1 if one[i]-two[i] > 100
    0

    ## Original difference using Euclidian distance
    ## (reinvents CIE76)
    # for i in [0..3]
    #   total += Math.sqrt(Math.pow((one[i]-two[i]),2))
    # total

  column_difference = (x1,x2) ->
    total = 0
    for y in [0...unshredded.height]
      total += pixel_difference(x1,y,x2,y)
    total

  strips = [0..19]

  right_edge = (strip) ->
    strip*STRIP_WIDTH+(STRIP_WIDTH-1)

  left_edge = (strip) ->
    strip*STRIP_WIDTH

  strip_difference =
    for strip1 in strips
      for strip2 in strips
        column_difference right_edge(strip1),left_edge(strip2)

  ordered_neighbors =
    for strip in strips
      _.sortBy _.without(strips,strip), (other_strip) -> strip_difference[strip][other_strip]

  total_difference = (sorted_strips) ->
    total = 0
    for idx in [0..sorted_strips.length-2]
      total += strip_difference[sorted_strips[idx]][sorted_strips[idx+1]]
    total

  draw_from_to = (sourceStrip, targetStrip) ->
    unshredded_context.drawImage(imageObj, 0+32*sourceStrip, 0, STRIP_WIDTH,
      STRIP_HEIGHT, 0+32*targetStrip, 0, STRIP_WIDTH, STRIP_HEIGHT)

  draw = (sorted_strips) ->
    for idx,strip of sorted_strips
      draw_from_to(strip,idx)

  least_difference = Number.MAX_VALUE

  now = -> (new Date()).getTime()

  call_count = 0
  start = now()

  unscramble = (unsorted,sorted,depth) ->
    call_count++
    if unsorted.length is 0
      td = total_difference(sorted)
      if td < least_difference
        least_difference = td
        console.log td,sorted
        draw(sorted)
      return
    if sorted.length is 0
      for strip in unsorted
        unscramble _.without(unsorted,strip),[strip],depth
      return
    for next in _.difference(ordered_neighbors[_.last(sorted)],sorted)[0..depth]
      unscramble _.without(unsorted,next),sorted.concat([next]),depth
    return

  unscramble(strips,[],0)
  end = now()
  took = (end-start)/1000
  console.log "#{call_count} took #{took}s"