import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FindEventsQueryDto } from './dto/find-events-query.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('searchQuery') searchQuery?: string,
  ) {
    return this.eventsService.findAll({ category, searchQuery });
  }

  // IMPORTANT: 'nearby' must come BEFORE ':id', otherwise NestJS
  // will think the word "nearby" is an ID and hit the findOne route!
  @Get('nearby')
  findNearby(@Query() query: FindEventsQueryDto) {
    return this.eventsService.findNearby(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // Assuming you are using UUIDs as strings.
    // Removed the '+' sign which was casting it to a number.
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
